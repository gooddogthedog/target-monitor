import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccountWorkspacePage } from '../../src/features/accounts/AccountWorkspacePage';

it('keeps known, strong inference, and must learn visibly distinct', () => {
  render(
    <MemoryRouter>
      <AccountWorkspacePage />
    </MemoryRouter>,
  );

  expect(screen.getByRole('heading', { name: 'RaceTrac' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Known' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Strong inference' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Must learn' })).toBeVisible();
  expect(screen.getByText(/buyer path not selected/i)).toBeVisible();
  expect(screen.getByRole('link', { name: /open evidence ledger/i })).toHaveAttribute(
    'href',
    '/evidence',
  );
});

