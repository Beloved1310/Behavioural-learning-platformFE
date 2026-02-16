import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

import { logger } from './utils/logger';

// Suppress MetaMask phishing detection errors (from browser extensions)
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    // Filter out MetaMask phishing detection 404 errors
    if (
      args.some(
        (arg) =>
          typeof arg === 'string' &&
          (arg.includes('eth-phishing-detect') ||
            arg.includes('raw.githubusercontent.com/MetaMask'))
      )
    ) {
      return; // Suppress this error
    }
    originalError.apply(console, args);
  };
}

// Initialize logger
logger.info('Application initialized');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
