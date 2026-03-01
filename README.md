# Logistics Route Optimization Tool

A full-stack web application that plans delivery routes for vehicles and uses AI to adjust routes based on traffic predictions.

## Features
- Interactive map (Leaflet.js + OpenStreetMap) for plotting delivery points
- MongoDB storage for delivery addresses and vehicle data
- Google Gemini AI for traffic pattern analysis
- Custom route optimization algorithm (Nearest Neighbor + 2-opt)
- Real-time re-routing when incidents occur
- Priority-based delivery sequencing (High/Medium/Low)
- ETA calculations for each stop

## Tech Stack
- **Frontend:** React.js, Leaflet.js, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **AI:** Google Gemini API
- **Styling:** Custom CSS

## Project Structure
```
logistics-optimizer/
├── client/          # React frontend
├── server/          # Node.js backend
└── sample-data/     # Sample delivery data
```

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB v6+
- Google Gemini API Key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/logistics-optimizer.git
cd logistics-optimizer
```

2. Setup Backend
```bash
cd server
npm install
```

Create `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/logistics_optimizer
GEMINI_API_KEY=your_gemini_api_key_here
```

3. Setup Frontend
```bash
cd client
npm install
```

Create `client/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### Running the App

Terminal 1 - Start MongoDB:
```bash
mongod --dbpath C:\data\db
```

Terminal 2 - Start Backend:
```bash
cd server
npm run dev
```

Terminal 3 - Start Frontend:
```bash
cd client
npm run dev
```

Open browser at `http://localhost:5173`

## Usage
1. Go to Vehicles tab and add a vehicle
2. Click on the map to add delivery points
3. Select a vehicle
4. Click Optimize Route
5. View optimized sequence with ETAs and AI traffic analysis
6. Use Report Incident to trigger re-routing

## Sample Data
Sample delivery data is available in `sample-data/deliveries.json`