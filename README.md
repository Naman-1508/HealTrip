# HealTrip 🩺✈️  
AI-Powered Medical Travel Planner

HealTrip is a full-stack medical tourism platform designed to simplify healthcare-focused travel by bringing hospitals, doctors, treatment packages, accommodation, and travel planning into one unified system. The platform leverages AI and machine learning to recommend verified medical providers and create personalized, recovery-friendly itineraries, making medical travel reliable, transparent, and stress-free.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)

## 📌 Problem Statement
Medical tourism is highly fragmented. Patients often rely on multiple unverified sources for hospital details, doctor credibility, pricing, accommodation, and local guidance. This leads to confusion, lack of trust, and poor decision-making. HealTrip solves this problem by providing a single trusted platform that integrates healthcare discovery with travel planning.

## 🚀 Features
- Medical destination discovery based on disease or treatment needs  
- Verified hospitals and accredited doctors  
- Transparent treatment packages and pricing  
- Integrated planning for treatment, stay, and travel  
- Personalized recovery-friendly itineraries  
- Secure user authentication and session management  
- AI/ML-based hospital ranking and recommendations  

## 🎨 UI & Frontend
- Clean and minimal interface focused on usability and clarity  
- Built using React Bits components and ShadCN UI  
- Responsive layouts implemented with TailwindCSS  
- Card-based layouts for hospitals, packages, and itineraries  
- Subtle animations using Framer Motion and Lottie  

## 🛠 Tech Stack
Frontend: React.js, Vite, TailwindCSS, React Bits Components, ShadCN UI  
Backend: Node.js, Express.js, MongoDB Atlas, Clerk Authentication  
ML/AI: FastAPI (Python), Scikit-learn, Pandas, NumPy, Gemini API  
Payments: Razorpay (Domestic – India), Stripe (International)

## 🧠 Architecture Overview
HealTrip follows a modular, microservice-based architecture where the frontend communicates with backend REST APIs and ML services to deliver verified data, intelligent recommendations, and personalized itineraries.

## 📁 Project Structure
HealTrip/
├── backend/
│ ├── src/
│ │ ├── config/ # Environment and database configuration
│ │ ├── models/ # MongoDB schemas (users, hospitals, packages)
│ │ ├── routes/ # API route definitions
│ │ ├── controllers/ # Request handling and business logic
│ │ ├── services/ # ML integration, recommendations, utilities
│ │ ├── middleware/ # Authentication and validation middleware
│ │ ├── utils/ # Helper functions and constants
│ │ └── server.js # Express server entry point
│ ├── package.json
│ └── .env
├── frontend/
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Application pages (Home, Packages, Details)
│ │ ├── layouts/ # Layout wrappers
│ │ ├── hooks/ # Custom React hooks
│ │ ├── services/ # API service handlers
│ │ ├── styles/ # Global and component styles
│ │ ├── assets/ # Images and static assets
│ │ ├── App.jsx # Main application component
│ │ └── main.jsx # React entry point
│ ├── public/
│ ├── package.json
│ └── vite.config.js
├── ml/
│ ├── hospitals/ # Hospital ranking ML models
│ ├── itineraries/ # Recommendation logic
│ ├── data/ # Datasets and preprocessing scripts
│ └── main.py # ML service entry point
├── README.md

## 🎯 Objective
To make medical tourism accessible, reliable, and user-friendly by providing a unified AI-powered platform that supports patients throughout their medical travel journey.

## 🏆 Hackathon
Built as part of **WHACKIEST’25 Hackathon**  
Team Name: **Badi Bhindi**

## 🤝 Contributing
Contributions are welcome. Feel free to fork the repository and submit a pull request.

## 📝 License
MIT License
