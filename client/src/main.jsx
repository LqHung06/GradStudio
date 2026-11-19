import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/base-and-pages.css";
import "./styles/responsive-layout.css";
import "./styles/chat-and-motion.css";
import "./styles/studio-workspace.css";
import "./styles/editorial-refinements.css";
import { ScrollBackground } from "./components/Layout.jsx";
import { FloatingChat } from "./components/FloatingChat.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { StudioPage } from "./pages/StudioPage.jsx";
import { BookingPage } from "./pages/BookingPage.jsx";
function App() {
  React.useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('section-revealed'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll('.service-section, .gallery-section, .process-section, .handoff').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  const path = window.location.pathname;
  const isStudio = path.endsWith('studio.html');
  const page = isStudio ? <StudioPage /> : path.endsWith('booking.html') ? <BookingPage /> : <HomePage />;
  return <><ScrollBackground />{page}{!isStudio && <FloatingChat />}</>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
