// E:\logistics-optimizer\server\services\geminiService.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getTrafficPrediction(optimizedRoute, vehicle) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const stops = optimizedRoute.sequence.map((stop, idx) =>
      `${idx + 1}. ${stop.delivery.address} (${stop.delivery.priority} priority, ETA: ${stop.estimatedArrival})`
    ).join(', ');

    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

    const prompt = `Logistics route: ${optimizedRoute.sequence.length} stops, ${optimizedRoute.totalDistance}km, ${timeOfDay}. Stops: ${stops}. Give 3 brief traffic tips in 60 words max.`;

    const result = await model.generateContent(prompt);
    return result.response.text();

  } catch (error) {
    if (error.message.includes('429')) {
      return 'AI traffic analysis is temporarily unavailable due to rate limits. Route has been optimized using distance-based algorithm. Please try again in a few minutes.';
    }
    console.error('Gemini API error:', error.message);
    throw new Error('Failed to get AI traffic prediction');
  }
}

async function getReroutingSuggestion(currentLocation, remainingDeliveries, incident) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const remaining = remainingDeliveries.map((d, idx) =>
      `${idx + 1}. ${d.address} (${d.priority})`
    ).join(', ');

    const prompt = `Delivery incident: "${incident}". Remaining stops: ${remaining}. Give brief re-routing advice in 50 words.`;

    const result = await model.generateContent(prompt);
    return result.response.text();

  } catch (error) {
    if (error.message.includes('429')) {
      return 'Re-routing suggestion unavailable due to rate limits. Please try again shortly.';
    }
    console.error('Gemini re-routing error:', error.message);
    throw new Error('Failed to get re-routing suggestion');
  }
}

module.exports = { getTrafficPrediction, getReroutingSuggestion };