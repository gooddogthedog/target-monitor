import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LibraryPage } from '../../src/features/library/LibraryPage';

it('shows versioned, local-only customer artifacts', () => {
  render(<MemoryRouter><LibraryPage /></MemoryRouter>);
  expect(screen.getByText(/RaceTrac deal thesis/i)).toBeVisible();
  expect(screen.getByText(/Version 3/i)).toBeVisible();
  expect(screen.getByText(/downloads stay on this device/i)).toBeVisible();
  expect(screen.getAllByRole('button', { name: /download locally/i }).length).toBeGreaterThan(0);
});

