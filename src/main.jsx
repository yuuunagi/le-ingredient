import React from 'react';
import ReactDOM from 'react-dom/client';
// import App from "./App";
import Router from '@/routers';
import './i18n';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <Router />
);
