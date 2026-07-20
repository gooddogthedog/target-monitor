import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SettingsPage } from '../../src/features/settings/SettingsPage';

it('keeps core work available when email and calendar are unavailable', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><SettingsPage /></MemoryRouter>);

  await user.selectOptions(screen.getByLabelText(/email source health/i), 'temporarily-unavailable');
  await user.selectOptions(screen.getByLabelText(/calendar source health/i), 'not-connected');

  expect(screen.getByText(/manual notes and tasks.*always available/i)).toBeVisible();
  expect(screen.getByRole('link', { name: /continue to targets/i })).toHaveAttribute('href', '/targets');
  expect(screen.getByText(/missing integrations never become negative customer evidence/i)).toBeVisible();
});

it('requires explicit confirmation before resetting demo data', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><SettingsPage /></MemoryRouter>);
  await user.click(screen.getByRole('button', { name: /reset demo data/i }));
  expect(screen.getByRole('dialog', { name: /reset local demo data/i })).toBeVisible();
  expect(screen.getByRole('button', { name: /confirm reset/i })).toBeDisabled();
  await user.click(screen.getByRole('checkbox', { name: /replace my local demo edits/i }));
  expect(screen.getByRole('button', { name: /confirm reset/i })).toBeEnabled();
});

