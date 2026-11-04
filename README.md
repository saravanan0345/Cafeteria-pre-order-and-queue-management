# CAFETERIA PRE-ORDER & QUEUE MANAGEMENT SYSTEM

> **A Modern, Full-Stack Academic Project for Campus Dining Operations**  
> Eliminates physical lunch queues, ensures atomic FIFO token sequencing, provides digital kitchen display management (KDS), and displays real-time counter notifications.

---

## 🌟 Key Highlights & Academic Innovations

1. **Atomic FIFO Queue Sequencing:**
   - Sequential, conflict-free daily token generator (`A001`, `A002`, `B001`, etc.) backed by ACID transactional persistence.
   - Dynamic recalculation of queue positions and estimated wait times upon order placement, preparation, completion, or cancellation.
2. **Real-Time Dual Synchronization (Socket.IO):**
   - Instant bi-directional communication between students' phones, kitchen counter terminals, and public TV display monitors without page refreshes.
   - Built-in Web Audio API counter chime when an order is called at the pickup counter.
3. **Role-Based Portals (3 Tailored Stakeholder Experiences):**
   - **Student Portal:** Browse menu, dietary filters (Pure Veg / Non-Veg), scheduling pickup slots within operating hours, campus dining wallet, pre-order checkout, and live visual progress tracking.
   - **Kitchen Staff Portal (KDS):** Visual order cards designed for kitchen touchscreen usage. One-click progress transitions (`Confirmed` → `Preparing` → `Ready for Pickup` → `Completed`) and instantaneous menu stock availability toggles.
   - **Administrator Command Center:** Live financial metrics (Total Revenue, Today's Sales, Average Order Value), 7-day daily volume trends, food catalog CRUD with image previews, order status modifications, and student directory.
4. **Digital TV Queue Display Board:**
   - Dedicated full-screen public monitor display showing "Now Serving / Ready for Pickup" (glowing green cards with counter assignment), "Now Preparing in Kitchen", and "Waiting in Queue" ticker.

---

## 🛠️ Technology Stack

- **Frontend:**
  - React 18 + Vite (lightning-fast build & HMR)
  - Tailwind CSS (Warm cream `#FDFBF7`, charcoal `#1E2022`, and vibrant amber/orange `#F97316`)
  - Lucide React (modern icon suite)
  - React Router v6
  - Canvas Confetti (celebratory order confirmation animation)
  - Socket.IO Client (instant real-time updates)
  - Axios (REST client with JWT interceptors)
- **Backend:**
  - Node.js & Express.js
  - Socket.IO Server (real-time broadcast engine)
  - JWT (JSON Web Tokens) with Role-Based Access Control
  - Bcrypt.js (secure password hashing)
  - CORS & Dotenv
- **Database & Concurrency:**
  - ACID-compliant transactional JSON database engine with synchronous atomic writes (`cafeteria-db.json`)
  - Zero external database installation or setup required for evaluators.

---

## 👥 Pre-Configured Demo Credentials

For quick evaluation during college project presentations, 1-click login buttons are embedded directly into the login screen and hero section:

| Role | Email | Password | Access / Dashboard |
| :--- | :--- | :--- | :--- |
| **Student** | `student@college.edu` | `password123` | Pre-order meals, track token & live queue |
| **Kitchen Staff** | `staff@college.edu` | `password123` | Kitchen KDS, update status, toggle stock |
| **Administrator** | `admin@college.edu` | `password123` | Analytics, food CRUD, order control |

---

## 🚀 How to Run the Project

### Option 1: One-Click Windows Launcher
Double-click the `start-project.bat` file in this directory. It will launch both the backend server and frontend development server in separate console windows.

### Option 2: Running via Terminal

#### 1. Start the Backend Server:
```bash
cd backend
npm start
```
*Backend runs on `http://localhost:5000`*

#### 2. Start the Frontend Application:
In a new terminal window:
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 📋 Recommended Presentation Demonstration Workflow

1. **Step 1: Open the Public Live Queue TV Board**
   - Navigate to `http://localhost:5173/queue-board` on a projector or separate browser tab.
   - Show the live clock, current serving token (`A002`), and audio chime toggle.

2. **Step 2: Demonstrate the Student Pre-Order Flow**
   - Click **"1-Click Student Login"** on the homepage or sign in as `student@college.edu`.
   - Browse the 17-item menu, filter by **"Pure Veg Only"**, and add dishes to cart.
   - Proceed to **Pre-Order Slot & Checkout**, pick a pickup time slot (e.g. `12:30 PM`), and place the order.
   - Observe the confetti celebration and instant generation of a new unique token (e.g. `A005`).
   - Show the **Order Tracking Page** with the 4-step progress stepper and queue position ("#1 in line").

3. **Step 3: Demonstrate Kitchen Staff KDS Actions (Dual Screen Sync)**
   - Open a new tab or incognito window, log in as **Kitchen Staff** (`staff@college.edu`).
   - Notice the newly submitted order immediately appears on the kitchen screen.
   - Click **"🍳 Start Preparing"** → Watch the student's screen update to "Preparing in Kitchen" in real time without refreshing!
   - Click **"🔔 Mark Ready for Pickup"** → Hear the pleasant counter chime ring, see the student's status turn green, and see the token appear on the **Live Queue TV Board** under **"Now Serving at Counter 1"**!
   - Click **"✅ Complete Pickup"** to mark the order fulfilled.

4. **Step 4: Demonstrate the Administrator Command Center**
   - Log in as **Admin** (`admin@college.edu`).
   - Review live financial metrics, 7-day order volume trends, and popular dishes.
   - Add a new dish with image URL, price, and category in the **Food Menu CRUD** tab.

---

## 📂 Project Directory Structure

```
Cafeteria pre order/
├── backend/
│   ├── data/
│   │   └── cafeteria-db.json     # Persistent database
│   ├── middleware/
│   │   └── auth.js               # JWT & Role validation
│   ├── routes/
│   │   ├── authRoutes.js         # Login, register, demo users
│   │   ├── foodRoutes.js         # Food items CRUD & filters
│   │   ├── orderRoutes.js        # Atomic pre-ordering & FIFO queue
│   │   ├── queueRoutes.js        # Live queue state & status transitions
│   │   └── statsRoutes.js        # Real administrative analytics
│   ├── database.js               # ACID DB engine & atomic token sequencer
│   ├── server.js                 # Express + Socket.IO server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Footer, FoodCard, CartDrawer
│   │   ├── context/              # AuthContext, CartContext, ToastContext
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx          # Presentation landing page
│   │   │   ├── MenuPage.jsx             # Filterable food menu
│   │   │   ├── PreOrderCheckoutPage.jsx # Pickup time slot & checkout
│   │   │   ├── OrderTrackingPage.jsx    # Real-time token tracking
│   │   │   ├── LiveQueueBoard.jsx       # TV digital signage display
│   │   │   ├── StudentDashboard.jsx     # Student hub & order history
│   │   │   ├── StaffDashboard.jsx       # Kitchen Display System (KDS)
│   │   │   ├── AdminDashboard.jsx       # Management analytics & CRUD
│   │   │   ├── LoginPage.jsx            # Auth & 1-click demo logins
│   │   │   └── RegisterPage.jsx         # User registration
│   │   ├── services/             # Axios API client & Socket.IO client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css             # Tailwind design system
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── start-project.bat             # One-click Windows starter
├── README.md                     # Comprehensive documentation
└── package.json
```
