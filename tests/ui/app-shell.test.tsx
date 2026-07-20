import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppShell } from '../../src/ui/AppShell';

it('exposes every primary destination and outbound-disabled status', () => {
  render(
    <MemoryRouter>
      <AppShell>
        <div>Route body</div>
      </AppShell>
    </MemoryRouter>,
  );

  for (const label of [
    'Today',
    'All Actions',
    'Daily Brief',
    'Targets',
    'Pipeline',
    'Evidence',
    'Approvals',
    'Library',
  ]) {
    expect(screen.getByRole('link', { name: label })).toBeVisible();
  }

  expect(screen.getByText('Outbound disabled')).toBeVisible();
  expect(screen.getByText('Route body')).toBeVisible();
});
