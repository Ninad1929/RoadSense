# 🚗 RoadSense (SpotHoles)

> **Real-Time Pothole & Road Quality Monitoring System**

RoadSense is a modern web application designed for real-time monitoring, tracking, visualization, and analysis of road surface quality and pothole occurrences. It provides municipal authorities, road maintenance teams, and civic organizations with actionable insights into road infrastructure conditions using interactive geospatial mapping, live telemetry streams, and data analytics.

---

## 🌟 Key Features

- 🗺️ **Interactive Geospatial Mapping**: Live vector map displaying road segments, pothole coordinates, confidence metrics, and color-coded road health statuses (Good, Moderate, Poor).
- ⚡ **Real-Time Telemetry & Live Feed**: Direct integration with Firebase Firestore alongside a built-in telemetry simulator for streaming live road inspection reports.
- 📊 **Analytics & Data Visualization**: Interactive charts for condition distribution, severity breakdown, and historical trend analysis powered by Recharts.
- 📋 **Road Reports & Management**: Filterable inspection logs, detailed anomaly popups, confidence ratings, and export options.
- 🎨 **Modern Design & Dark UI**: Sleek, responsive user interface built with Tailwind CSS v4 and Lucide React iconography.

---

## 🛠️ Technologies Used

### Core & Framework
- **[React 19](https://react.dev/)** (`v19.2.7`) – Modern component-based UI library.
- **[Vite 8](https://vitejs.dev/)** (`v8.1.1`) – Next-generation frontend build tool and development server.
- **[React Router 7](https://reactrouter.com/)** (`v7.18.1`) – Client-side routing and navigation.

### Styling & UI
- **[Tailwind CSS 4](https://tailwindcss.com/)** (`v4.3.2`) – Utility-first CSS framework with Vite plugin integration (`@tailwindcss/vite`).
- **[Lucide React](https://lucide.dev/)** (`v1.24.0`) – Clean, consistent UI icon set.

### Geospatial & Mapping
- **[MapLibre GL JS](https://maplibre.org/)** (`v3.6.2`) – High-performance WebGL-based vector map renderer.
- **[OpenFreeMap](https://openfreemap.org/)** – Free, open vector tile server provider.

### Data Visualization & Backend
- **[Recharts](https://recharts.org/)** (`v3.9.2`) – Composable chart library for React.
- **[Firebase SDK 12](https://firebase.google.com/)** (`v12.16.0`) – Realtime backend services and Firestore database integration.

### Tooling & Code Quality
- **[Oxlint](https://oxc.rs/)** (`v1.71.0`) – Fast JavaScript/JSX linter powered by Oxc.

---

## 📁 Project Structure

```
RoadSense/
├── public/                # Static public assets
├── src/
│   ├── components/        # Reusable UI & feature components
│   │   ├── Alerts/        # Alert notification components
│   │   ├── Analytics/     # Data visualization cards & charts
│   │   ├── Dashboard/     # Main dashboard widgets
│   │   ├── Header/        # Application header bar
│   │   ├── LiveFeed/      # Real-time inspection event feeds
│   │   ├── LiveMonitoring/# Live map monitoring controls
│   │   ├── Map/           # MapView component integrated with MapLibre GL
│   │   ├── Reports/       # Road report tables and details
│   │   ├── Sidebar/       # Navigation sidebar
│   │   └── ui/            # Shared base UI components (map wrappers, buttons)
│   ├── config/            # Application settings & threshold configurations
│   ├── data/              # Mock dataset fallback & seed data
│   ├── hooks/             # Custom React hooks
│   ├── layouts/           # App layout wrappers (Sidebar + Header + Main outlet)
│   ├── pages/             # Main application views
│   │   ├── Analytics.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ExportData.jsx
│   │   ├── LiveMonitoring.jsx
│   │   ├── Reports.jsx
│   │   └── Settings.jsx
│   ├── services/          # Firebase initialization & road report services
│   │   ├── firebase.ts
│   │   ├── firebaseSimulator.js
│   │   └── roadReportService.ts
│   ├── types/             # Type definitions & data interfaces
│   ├── utils/             # Helper utilities (timestamp formatters, calculations)
│   ├── App.jsx            # Top-level routing setup
│   ├── main.jsx           # React app entry point
│   └── index.css          # Global CSS & Tailwind imports
├── .env                   # Environment variables (Firebase config)
├── .oxlintrc.json         # Oxlint configuration rules
├── package.json           # Node dependencies and scripts
└── vite.config.js         # Vite configuration with Tailwind CSS plugin
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **[Node.js](https://nodejs.org/)** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ninad1929/SpotHoles.git
   cd RoadSense
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create or edit the `.env` file in the root directory and provide your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 📜 Available Scripts

In the project directory, you can run:

- **`npm run dev`**: Runs the app in development mode with Hot Module Replacement (HMR).
- **`npm run build`**: Compiles and bundles the application for production deployment into the `dist/` folder.
- **`npm run preview`**: Serves the production build locally for testing.
- **`npm run lint`**: Runs Oxlint to inspect JavaScript/JSX files for potential errors and code style issues.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

