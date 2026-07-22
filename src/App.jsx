import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./theme.css";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import ProjectPage from "./pages/ProjectPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <div className="site-root">
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projetos/:slug" element={<ProjectPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
