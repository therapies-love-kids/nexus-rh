import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './main.scss';
import ErrorBoundary from './ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);

postMessage({ payload: 'removeLoading' }, '*');