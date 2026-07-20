import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ApprovalsPage } from '../../src/features/approvals/ApprovalsPage';

it('invalidates an exact-action authorization when the payload changes', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><ApprovalsPage /></MemoryRouter>);

  expect(screen.getByText(/demo—no message will be sent/i)).toBeVisible();
  await user.click(screen.getByRole('button', { name: /review exact action/i }));
  await user.click(screen.getByRole('button', { name: /lock exact action/i }));
  await user.click(screen.getByRole('button', { name: /approve this exact action/i }));
  await user.click(screen.getByRole('button', { name: /confirm demo presence/i }));

  expect(screen.getByRole('button', { name: /complete demo action/i })).toBeEnabled();
  await user.type(screen.getByLabelText(/exact content/i), '!');
  expect(screen.getByRole('status')).toHaveTextContent(/approval invalidated/i);
  expect(screen.getByRole('button', { name: /complete demo action/i })).toBeDisabled();
});

it('creates only a completed demo receipt', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><ApprovalsPage /></MemoryRouter>);
  await user.click(screen.getByRole('button', { name: /review exact action/i }));
  await user.click(screen.getByRole('button', { name: /lock exact action/i }));
  await user.click(screen.getByRole('button', { name: /approve this exact action/i }));
  await user.click(screen.getByRole('button', { name: /confirm demo presence/i }));
  await user.click(screen.getByRole('button', { name: /complete demo action/i }));
  expect(screen.getByRole('heading', { name: /completed demo receipt/i })).toBeVisible();
  expect(screen.getByText(/no external provider was contacted/i)).toBeVisible();
});
