import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

// Add console error listener for debugging
const originalConsoleError = console.error;
console.error = (...args) => {
  originalConsoleError(...args);
  // Uncomment if you want errors to make tests fail
  // if (args[0] instanceof Error) {
  //   throw args[0];
  // }
};

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Improve fake timers
vi.useFakeTimers();

// Mock React Router components and hooks globally for all tests
vi.mock('react-router-dom', () => {
  const actual = vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }) => React.createElement(React.Fragment, null, children),
    useNavigate: () => vi.fn(),
    useLocation: () => ({ 
      pathname: '/movies', 
      search: '', 
      hash: '', 
      state: null 
    }),
    Navigate: ({ to }) => React.createElement('div', null, `Navigate to ${to}`),
  };
});

// Any additional setup for tests can go here
