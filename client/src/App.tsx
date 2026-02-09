import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Arena from "@/pages/Arena";
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/arena" element={<Arena />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

