import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App";

// Simulator disabled — real hardware data only
// import { startFirebaseSimulator } from "./services/firebaseSimulator";
// startFirebaseSimulator();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);