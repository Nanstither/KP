import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initAPI } from './services/api';
import './index.css';

initAPI().then(() => {
  const root = createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});