import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { ProjectsProvider } from "./context/ProjectsContext";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter><ProjectsProvider><App /></ProjectsProvider></HashRouter>
  </React.StrictMode>,
);
