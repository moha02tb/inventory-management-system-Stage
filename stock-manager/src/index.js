import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// 1. Import BrowserRouter directly
import { BrowserRouter } from 'react-router-dom'; 
// 2. Import AuthProvider (Keep this)
import { AuthProvider } from './context/AuthContext'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 3. Wrap everything once in the Router */}
    <BrowserRouter> 
      {/* 4. Wrap the App in the AuthProvider */}
      <AuthProvider> 
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);