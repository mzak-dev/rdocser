/** Browser entry point for the client-only Rdocser SPA. */
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./runtime/App";
import { ThemeProvider } from "./runtime/theme/ThemeProvider";
import theme from "virtual:rdocser/theme";
import "./styles.css";
createRoot(document.getElementById("root")!).render(<React.StrictMode><ThemeProvider theme={theme}><App /></ThemeProvider></React.StrictMode>);

