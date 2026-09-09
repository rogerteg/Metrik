import '@testing-library/jest-dom';

// Provide default stub for window.confirm in JSDOM
if (typeof window !== 'undefined') {
  window.confirm = () => true;
}
