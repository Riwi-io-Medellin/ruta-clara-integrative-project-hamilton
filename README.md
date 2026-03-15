# Ruta Clara

Hello, welcome to Ruta Clara. This project was born out of the need to make the daily operations of cleaning and maintenance teams more efficient. It's a web app that combines a simple interface for workers with a solid backend that uses AI to assist with tasks.

## What does Ruta Clara do?

The main idea is to streamline the management of cleaning and maintenance tasks. Cleaners can view their assignments, track the time spent on each one, report zones, manage inventories, and even chat with the team — all with an AI layer to quickly answer questions.

## Key Features

- **Tasks & Execution:** Live tracking of pending work, with timers to keep things on schedule.
- **Safety Protocols:** Reminders and checklists for OHS (Occupational Health & Safety).
- **Zone Reports:** Generate detailed reports for each area worked.
- **Inventory:** Track what's available and move items between locations.
- **Chat:** Direct communication between team members.
- **Integrated AI:** Uses OpenAI to help with questions and suggestions.
- **Dashboard:** A general overview for supervisors, with metrics and real-time status.
- **Maintenance:** Schedule and track preventive maintenance tasks.
- **Authentication:** Secure login with role-based permissions.

## Tech Stack

### Backend
- **Node.js + Express** — REST API
- **PostgreSQL** — Structured data
- **MongoDB** — Flexible data (chat, etc.)
- **OpenAI** — AI integration

### Frontend
- **JavaScript + Vue.js** — UI framework
- **Vite** — Fast development build tool
- **Bootstrap** — Responsive styling
- **Axios** — Backend communication
- **Socket.io** — Real-time chat

## Installation

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- MongoDB
- npm or yarn

### Backend

```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Run database migrations
npm run migrate

# Start the server
npm run dev
```

### Frontend

```bash
# Navigate to the frontend folder
cd frontend/ruta-clara

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Usage

Open your browser at `http://localhost:3000` (or the port you configured). Log in and explore the sections from the dashboard: **Tasks** to get to work, **Inventory** to manage supplies, **Chat** to communicate, and **Reports** to review completed work.

## Project Structure

```
ruta-clara/
├── backend/                          # Backend server
│   ├── app.js                        # Main entry point
│   ├── debug_execution.js            # Debugging utilities
│   ├── package.json                  # Backend dependencies
│   ├── migrations/                   # SQL migration scripts
│   │   ├── 001_add_duracion_fields.sql
│   │   └── add_duracion_fields.sql
│   └── src/
│       ├── config/                   # Database configuration
│       │   ├── db.js                 # PostgreSQL config
│       │   └── mongo.js              # MongoDB config
│       ├── controllers/              # Business logic
│       │   ├── ai.controller.js      # AI controller
│       │   ├── auth.controller.js    # Auth controller
│       │   ├── chat.controller.js    # Chat controller
│       │   ├── cleaning.controller.js# Cleaning controller
│       │   ├── execution.controller.js# Task execution controller
│       │   ├── inventory.controller.js# Inventory controller
│       │   ├── maintenance.controller.js# Maintenance controller
│       │   └── transfer.controller.js# Transfer controller
│       ├── middlewares/              # Middlewares
│       │   └── auth.middleware.js    # Auth middleware
│       ├── models/                   # Data models
│       │   ├── Chat.model.js         # Chat model
│       │   ├── Inventory.model.js    # Inventory model
│       │   ├── TaskExecution.model.js# Task execution model
│       │   └── Transfer.model.js     # Transfer model
│       ├── routes/                   # API route definitions
│       │   ├── ai.routes.js          # AI routes
│       │   ├── auth.routes.js        # Auth routes
│       │   ├── chat.routes.js        # Chat routes
│       │   ├── cleaning.routes.js    # Cleaning routes
│       │   ├── execution.routes.js   # Execution routes
│       │   ├── inventory.routes.js   # Inventory routes
│       │   ├── maintenance.routes.js # Maintenance routes
│       │   └── transfer.routes.js    # Transfer routes
│       └── services/                 # External services
│           └── openai.service.js     # OpenAI service
└── frontend/                         # Frontend interface
    └── ruta-clara/
        ├── index.html                # Main HTML page
        ├── package.json              # Frontend dependencies
        ├── vite.config.js            # Vite configuration
        └── src/
            ├── main.js               # Frontend entry point
            ├── api/                  # API services
            │   ├── ai.service.js     # AI service
            │   ├── auth.service.js   # Auth service
            │   ├── axiosConfig.js    # Axios config
            │   ├── chat.service.js   # Chat service
            │   ├── execution.service.js# Execution service
            │   ├── inventory.service.js# Inventory service
            │   ├── maintenance.service.js# Maintenance service
            │   ├── socket.js         # Socket.io config
            │   └── transfer.service.js# Transfer service
            ├── assets/               # Static assets
            │   ├── clean.css         # Cleaning styles
            │   ├── dashboard.css     # Dashboard styles
            │   ├── ruta-clara.css    # Main styles
            │   ├── style.css         # Global styles
            │   └── Bootstrap/        # Bootstrap framework
            │       ├── css/          # Bootstrap stylesheets
            │       └── js/           # Bootstrap scripts
            ├── components/           # Reusable components
            │   ├── BottomNav.js      # Bottom navigation
            │   ├── Header.js         # Header
            │   ├── HomeHeader.js     # Home page header
            │   ├── Modal.js          # Modal component
            │   ├── ReportZone.js     # Zone reporting
            │   ├── Sidebar.js        # Sidebar
            │   ├── SSTProtocol.js    # OHS protocol
            │   └── TaskTimer.js      # Task timer
            ├── pages/                # Application pages
            │   ├── cleanPage.js      # Cleaning page
            │   ├── DashboardPage.js  # Dashboard
            │   ├── HomeCleaner.js    # Cleaner home
            │   ├── HomePage.js       # Home page
            │   ├── LoginPage.js      # Login page
            │   ├── NotFound.js       # 404 page
            │   ├── ScanPage.js       # Scan page
            │   └── ZonePage.js       # Zones page
            ├── routes/               # Routing config
            │   └── router.js         # Main router
            └── util/                 # Utilities
                ├── persistence.js    # Data persistence
                └── ux.js             # UX utilities
```

## Contributing

Contributions are welcome! Fork the repo, create a branch for your feature or fix, write clear commit messages, and open a PR. We're open to improvements.

## Credits

This project was developed by Emmanuel Cifuentes, Camilo Mitnick, Valeria Taborda, Salvador Aponte, and Juan José Guarín.
