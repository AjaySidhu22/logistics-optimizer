// E:\logistics-optimizer\server\services\geminiService.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function buildPrompt(optimizedRoute) {
  const stops = optimizedRoute.sequence.map((stop, idx) =>
    `${idx + 1}. ${stop.delivery.address} (${stop.delivery.priority} priority, ETA: ${stop.estimatedArrival})`
  ).join(', ');
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  return `Logistics route: ${optimizedRoute.sequence.length} stops, ${optimizedRoute.totalDistance}km, ${timeOfDay}. Stops: ${stops}. Give 3 brief traffic tips in 60 words max.`;
}

async function getGroqPrediction(prompt) {
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: 'You are a logistics traffic analyst. Give brief, practical traffic advice.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 150,
  });
  return response.choices[0].message.content;
}

async function getTrafficPrediction(optimizedRoute, vehicle) {
  const prompt = buildPrompt(optimizedRoute);

  // Try Gemini first
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    console.log('✅ Gemini AI responded successfully');
    return '🤖 Gemini: ' + result.response.text();
  } catch (geminiError) {
    console.log('⚠️ Gemini failed, trying Groq...', geminiError.message.slice(0, 50));

    // Try Groq as backup
    try {
      const suggestion = await getGroqPrediction(prompt);
      console.log('✅ Groq AI responded successfully');
      return '🤖 Groq AI: ' + suggestion;
    } catch (groqError) {
      console.log('⚠️ Groq also failed:', groqError.message.slice(0, 50));
      return 'Route optimized using distance-based algorithm. AI traffic analysis temporarily unavailable.';
    }
  }
}

async function getReroutingSuggestion(currentLocation, remainingDeliveries, incident) {
  const remaining = remainingDeliveries.map((d, idx) =>
    `${idx + 1}. ${d.address} (${d.priority})`
  ).join(', ');
  const prompt = `Delivery incident: "${incident}". Remaining stops: ${remaining}. Give brief re-routing advice in 50 words.`;

  // Try Gemini first
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    return '🤖 Gemini: ' + result.response.text();
  } catch (geminiError) {
    // Try Groq as backup
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a logistics re-routing assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 100,
      });
      return '🤖 Groq AI: ' + response.choices[0].message.content;
    } catch (groqError) {
      return 'Re-routing suggestion unavailable. Please try again shortly.';
    }
  }
}

module.exports = { getTrafficPrediction, getReroutingSuggestion };