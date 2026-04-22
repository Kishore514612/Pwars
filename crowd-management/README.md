# Venue Crowd Management System

A full-stack, real-time web application to simulate and monitor crowd densities across various zones of a large sporting venue.

## Features
- **Venue Simulation Engine**: Dynamically calculates and simulates crowd metrics based on current match phases.
- **Live Real-Time Dashboard**: Auto-updates the interface instantly without page reloads using WebSockets.
- **Smart Alert System**: Detects bottlenecks (>80% capacity) and calculates redirection routes on the fly.
- **Manual Control Override**: Directly intercept simulation metrics to test peak load performance during presentations.

## Project Structure
- `backend/`: Node.js, Express, WebSockets. 100% in-memory state. No external DB.
- `frontend/`: React + Vite. Plain Vanilla CSS with a custom-built sleek dark mode. No external UI frameworks.

---

## Quick Start Guide

To run the application, you will need to open **two separate terminal windows** (one for the backend, and one for the frontend).

### 1. Start the Backend Server

Open your first terminal, navigate to the project directory, and run the following commands:
```powershell
cd backend
npm install
npm start
```
*You will see `[Backend] Server running on http://localhost:3001` once it is successfully running.*

### 2. Start the Frontend Application

Open your second terminal, navigate to the project directory, and run the following commands:
```powershell
cd frontend
npm install
npm run dev
```
*Vite will start and provide a local URL (usually `http://localhost:5173`). Open that link in your web browser to view the application.*

---

## How to Test for the Demo
1. After starting both servers, the dashboard will load in the **Pre-Match** phase.
2. Use the **Override Controls** on the right side of the UI to forcefully assign a crowd count close to a zone's maximum capacity (e.g., set Gate A to 190 people).
3. Watch the **Smart Alerts** panel instantly trigger a warning and automatically advise crowds to route to a less dense alternate gate.
4. Experiment with toggling the **Timeline Override** (Match Phase) to watch mass crowd movement simulations cascade across the venue in real time.
