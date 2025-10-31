/**
 * @file index.tsx
 * @description Точка входа React-приложения.
 * Этот файл отвечает за рендеринг (монтирование) корневого компонента <App />
 * в DOM-элемент с id="root" в файле index.html.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);