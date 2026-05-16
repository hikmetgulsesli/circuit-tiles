import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders an application root', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
