import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DailyBriefPage } from '../../src/features/brief/DailyBriefPage';

it('shows three founder decisions with meaningful destinations and portfolio changes', () => {
  render(
    <MemoryRouter>
      <DailyBriefPage />
    </MemoryRouter>,
  );

  expect(screen.getByRole('heading', { name: /today's three decisions/i })).toBeVisible();
  expect(screen.getAllByTestId('brief-decision')).toHaveLength(3);
  expect(screen.getByRole('link', { name: /review racetrac draft/i })).toHaveAttribute(
    'href',
    '/approvals/action-racetrac-outreach',
  );
  expect(screen.getByRole('link', { name: /open h-e-b account/i })).toHaveAttribute(
    'href',
    '/targets/heb',
  );
  expect(screen.getByText(/2 replies received/i)).toBeVisible();
  expect(screen.getByText(/1 gate blocked/i)).toBeVisible();
});
