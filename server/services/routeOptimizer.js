// E:\logistics-optimizer\server\services\routeOptimizer.js

// Route Optimization using Nearest Neighbor + 2-opt improvement algorithm

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function haversineDistance(coord1, coord2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Nearest Neighbor Algorithm - greedy approach
 */
function nearestNeighbor(startCoord, deliveries) {
  const unvisited = [...deliveries];
  const sequence = [];
  let current = startCoord;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    unvisited.forEach((delivery, idx) => {
      const dist = haversineDistance(current, delivery.coordinates);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = idx;
      }
    });

    const nearest = unvisited.splice(nearestIdx, 1)[0];
    sequence.push({ delivery: nearest, distanceFromPrev: nearestDist });
    current = nearest.coordinates;
  }

  return sequence;
}

/**
 * 2-opt improvement algorithm
 * Tries to improve route by reversing segments
 */
function twoOpt(sequence, startCoord) {
  let improved = true;
  let bestSequence = [...sequence];

  while (improved) {
    improved = false;
    for (let i = 0; i < bestSequence.length - 1; i++) {
      for (let j = i + 1; j < bestSequence.length; j++) {
        const newSequence = twoOptSwap(bestSequence, i, j);
        if (calculateTotalDistance(newSequence, startCoord) < 
            calculateTotalDistance(bestSequence, startCoord)) {
          bestSequence = newSequence;
          improved = true;
        }
      }
    }
  }

  return bestSequence;
}

function twoOptSwap(sequence, i, j) {
  const newSeq = [...sequence.slice(0, i)];
  const reversed = sequence.slice(i, j + 1).reverse();
  return [...newSeq, ...reversed, ...sequence.slice(j + 1)];
}

function calculateTotalDistance(sequence, startCoord) {
  let total = 0;
  let prev = startCoord;
  sequence.forEach(stop => {
    total += haversineDistance(prev, stop.delivery.coordinates);
    prev = stop.delivery.coordinates;
  });
  return total;
}

/**
 * Calculate estimated arrival times
 */
function calculateETAs(sequence, startCoord, vehicleSpeed, startTime = '09:00') {
  let currentTime = parseTime(startTime);
  let prev = startCoord;

  return sequence.map(stop => {
    const distance = haversineDistance(prev, stop.delivery.coordinates);
    const travelTimeHours = distance / vehicleSpeed;
    const travelTimeMinutes = travelTimeHours * 60;
    const stopDuration = 10; // 10 min per stop

    currentTime += travelTimeMinutes + stopDuration;
    prev = stop.delivery.coordinates;

    return {
      ...stop,
      distanceFromPrev: Math.round(distance * 100) / 100,
      estimatedArrival: formatTime(currentTime)
    };
  });
}

function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = Math.round(totalMinutes % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Main optimization function
 */
function optimizeRoute(vehicle, deliveries) {
  const startCoord = vehicle.currentLocation;
  const speed = vehicle.speed || 40;

  // Step 1: Separate by priority
  const highPriority = deliveries.filter(d => d.priority === 'high');
  const mediumPriority = deliveries.filter(d => d.priority === 'medium');
  const lowPriority = deliveries.filter(d => d.priority === 'low');

  // Step 2: Nearest neighbor on each group
  const orderedHigh = highPriority.length > 0 ? nearestNeighbor(startCoord, highPriority) : [];
  const orderedMedium = mediumPriority.length > 0 ? nearestNeighbor(
    orderedHigh.length > 0 ? orderedHigh[orderedHigh.length - 1].delivery.coordinates : startCoord,
    mediumPriority
  ) : [];
  const orderedLow = lowPriority.length > 0 ? nearestNeighbor(
    orderedMedium.length > 0 ? orderedMedium[orderedMedium.length - 1].delivery.coordinates :
    orderedHigh.length > 0 ? orderedHigh[orderedHigh.length - 1].delivery.coordinates : startCoord,
    lowPriority
  ) : [];

  let sequence = [...orderedHigh, ...orderedMedium, ...orderedLow];

  // Step 3: Apply 2-opt improvement
  if (sequence.length > 2) {
    sequence = twoOpt(sequence, startCoord);
  }

  // Step 4: Calculate ETAs
  sequence = calculateETAs(sequence, startCoord, speed);

  // Step 5: Calculate totals
  const totalDistance = sequence.reduce((sum, stop) => sum + stop.distanceFromPrev, 0);
  const totalTime = Math.round((totalDistance / speed) * 60 + sequence.length * 10);

  // Step 6: Build waypoints array for map
  const waypoints = [
    { lat: startCoord.lat, lng: startCoord.lng, address: 'Start (Vehicle Location)' },
    ...sequence.map(stop => ({
      lat: stop.delivery.coordinates.lat,
      lng: stop.delivery.coordinates.lng,
      address: stop.delivery.address
    }))
  ];

  return {
    sequence,
    totalDistance: Math.round(totalDistance * 100) / 100,
    totalTime,
    waypoints
  };
}

module.exports = { optimizeRoute, haversineDistance };