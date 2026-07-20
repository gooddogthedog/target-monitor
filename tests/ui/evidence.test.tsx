import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { EvidencePage } from '../../src/features/evidence/EvidencePage';

it('preserves provenance, conflicts, and missing source coverage', async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <EvidencePage />
    </MemoryRouter>,
  );

  expect(screen.getByText(/email and calendar.*not connected/i)).toBeVisible();
  expect(screen.getByText(/not negative evidence/i)).toBeVisible();
  expect(screen.getAllByText(/ServiceChannel/i).length).toBeGreaterThan(0);

  await user.click(screen.getByRole('button', { name: /open ServiceChannel evidence/i }));
  expect(screen.getByRole('heading', { name: /ServiceChannel use confirmed/i })).toBeVisible();
  expect(screen.getByText(/captured July 18, 2026/i)).toBeVisible();
  expect(screen.getByText(/no known conflicts/i)).toBeVisible();
  expect(screen.getByText(/manual confirmation: confirmed/i)).toBeVisible();
});
