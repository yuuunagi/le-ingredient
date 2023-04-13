import React from 'react';
import ReactDOM from 'react-dom/client';
// import App from "./App";
import './styles.css';
import Router from '@/routers';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
