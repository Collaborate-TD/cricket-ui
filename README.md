# Cricket Coach App

This project introduces a modern approach to cricket coaching by integrating mobile-based video capture, annotation tools, and feedback management into a unified digital platform.

---

## 👥 Project Contributors

- Devarsh Bharatiya  
- Maharishi Vyas  
- Harsh Patel  
- Rishi Sehgal  
- Jatinderbir Singh  
- Mohit Gupta

---

## 🎯 Background & Objectives

Traditional cricket coaching relies heavily on verbal feedback and manual observation. This project was designed to:

- Digitize critical performance moments for analysis  
- Facilitate structured, player-specific feedback  
- Enhance learning through visual cues and recorded insights  
- Build a long-term, trackable coaching relationship

---

## 🎯 Project Scope

This application represents Phase 1 of the Cricket Coach App.  
Its current focus includes:

- Manual session recording and annotation  
- Feedback delivery via text, audio, and drills  
- Role-based access and session tracking

🔒 Not included in this phase:
- AI-based tagging or drill recommendation  
- Real-time motion detection or auto-feedback  
- Cloud-based media processing

These features are intended for future enhancement (Phase 2).

---

## 📦 Core Functionality

| Feature                    | Description                                                                 |
|----------------------------|-----------------------------------------------------------------------------|
| 🎥 Video Recording         | Capture 5-second practice clips on mobile devices                           |
| ✍️ Annotation Tools        | Draw over video, pause, and slow-motion review                              |
| 📝 Text Feedback           | Submit written observations linked to specific clips                        |
| 🎤 Voice Notes             | Add spoken feedback for deeper analysis                                     |
| 🏏 Drill Recommendations   | Assign structured training drills related to recorded actions               |
| 🖼️ Profile Picture Upload | Coaches and students can upload and view profile photos                     |
| 🔒 Role-Based Access       | Separate dashboards and permissions for coaches and students                |
| 🔁 Session History         | View all past coaching sessions linked to each player and coach             |

---

## 🔍 Use Case Highlights

### 🔹 Coach Perspective

- Organize practice sessions digitally  
- Focus feedback on actual observed footage  
- Save time by reusing annotated drills  
- Track each player’s progress across multiple sessions  

### 🔹 Student Perspective

- Access constructive feedback asynchronously  
- Visually connect errors with corrections  
- Build a performance library to track improvement over time  

---

## 🧠 System Architecture Overview

| Layer               | Technology                  |
|---------------------|-----------------------------|
| Frontend (Mobile)   | React Native + Expo         |
| Backend             | Node.js + Express.js        |
| Database            | MongoDB + Mongoose          |
| File Storage        | Multer + Local FileSystem   |
| Annotation Engine   | Expo Camera + SVG Overlay   |

---

## 📐 Data Model & Relationships

- Coaches can work with multiple students  
- Students can be trained by multiple coaches  
- Each session links both sides and stores:
  - 🎥 Video clip  
  - ✍️ Text and 🎤 voice feedback  
  - 🏏 Drill suggestions  
  - ⏱ Timestamped metadata  

---

## 📲 Interaction Workflow

### Coach  
Login → Select Student → Record Clip → Annotate → Add Feedback → Save Session

### Student  
Login → View Feedback → Watch Video + Comments → Review Drill Suggestions

---
## 🖥 Backend GitHub Repository

**Back End (master):** [https://github.com/Collaborate-TD/cricketlog-server](https://github.com/Collaborate-TD/cricketlog-server)

## 🧩 Deployment Instructions

### Prerequisites

- Node.js and npm  
- MongoDB (local or cloud)  
- Expo CLI  

### Steps

1. Clone the repository  
2. Install dependencies (both backend and frontend)  
3. Set up environment variables in `.env`  
4. Start backend and frontend servers

### Running the Project

1. npm install  
2. npm start

Note: If you encounter issues after the first run, adjust your .env file and run npm start again.

---

## 🧪 Future Enhancements

- 🤖 AI-generated feedback suggestions  
- 📈 Player performance analytics  
- 🔗 Cloud-based storage  
- 🧩 Drill recommendation engine  
- 🔔 Push notifications for feedback  

---

## 📜 Licensing

This project was developed as part of a graduate-level academic initiative at the **University of Windsor**, in collaboration with **Become Better**, an industry partner in the field of sports technology.

It is intended solely for educational and evaluative purposes.  
Commercial use, redistribution, or modification is strictly prohibited without prior written consent.

© All rights reserved by **Windsor Analytics** and the University of Windsor.  
Any external use of this project must be authorized by the project team.

---

## 📬 Contact

**Archit Singh**  
Cricket Coach & Founder – [Become Better](https://www.becomebetter.ca)  
Website: [www.becomebetter.ca](https://www.becomebetter.ca)
