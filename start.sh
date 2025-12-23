#!/bin/bash

# Start Backend
cd backend
npm install
npm start &
BACKEND_PID=$!

# Start Frontend (User)
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!

# Start Admin Frontend
cd ../admin-frontend
npm install
npm run dev &
ADMIN_PID=$!

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID $ADMIN_PID" EXIT

wait

