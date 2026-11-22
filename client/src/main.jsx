import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/base-and-pages.css';
import './styles/responsive-layout.css';
import './styles/chat-and-motion.css';
import './styles/studio-workspace.css';
import './styles/editorial-refinements.css';
import './styles/foundation.css';
import { App } from './App.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
