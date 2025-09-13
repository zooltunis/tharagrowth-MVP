import { createRoot } from "react-dom/client";
import { auth, db } from './lib/firebase';
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
