# Priority Allocator

A smart productivity scheduler that helps users plan tasks efficiently based on time, difficulty, and deadlines — like a personal assistant that auto-manages your day.

---

## Objective

I built this to solve my own struggle with task overload and poor prioritization. The goal is to reduce decision fatigue and create a customizable system that adapts to how you work — with future plans for calendar integration, analytics, and machine learning.

---

## Key Features

- Add tasks with estimated time, difficulty, and due date  
- Auto-prioritization using a weighted algorithm  
- View tasks within a dynamic, personalized calendar  
- Prevents overloading based on user preferences  
- Visual schedule feedback during recalibration  

---

## Tech Stack

- **Frontend:** React + Next.js + TypeScript  
- **Backend:** Node.js + Express  
- **Database:** PostgreSQL via Prisma  
- **Deployment:** Vercel (frontend), Railway/Render (backend)  
- **APIs:** Google Calendar, Outlook, Timezone

---

## 🛠️ Getting Started

```bash
git clone https://github.com/your-username/priority-allocator-app.git
cd priority-allocator-app
npm install
npx prisma migrate dev --name init

1. Run Server: 
    1. npm run dev 
    2. [http://localhost:3000](http://localhost:3000)


2. View Data
    1. Run: npx prisma studio
    2. [http://localhost:5555](http://localhost:5555)

