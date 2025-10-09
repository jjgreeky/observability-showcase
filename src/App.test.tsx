import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders observability showcase', () => {
  render(<App />);
  const heading = screen.getByText(/Observability Showcase/i);
  expect(heading).toBeInTheDocument();
});
