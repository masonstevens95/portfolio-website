import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { makeStore } from "./redux/store"; // adjust path if needed
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
const store = makeStore();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
