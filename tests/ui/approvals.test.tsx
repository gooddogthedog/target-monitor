import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppServiceProvider } from '../../src/app/AppServiceProvider';
import { createDemoAppService } from '../../src/application/demoAppService';
import { ApprovalsPage } from '../../src/features/approvals/ApprovalsPage';

function renderApprovals() {
  const service = createDemoAppService(`approvals-ui-${crypto.randomUUID()}`);
  return render(<AppServiceProvider service={service}><MemoryRouter><ApprovalsPage /></MemoryRouter></AppServiceProvider>);
}

it('invalidates an exact-action authorization when the payload changes', async () => {
  const user = userEvent.setup();
  renderApprovals();

  expect(await screen.findByText(/demo—no message will be sent/i)).toBeVisible();
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
  renderApprovals();
  await screen.findByText(/demo—no message will be sent/i);
  await user.click(screen.getByRole('button', { name: /review exact action/i }));
  await user.click(screen.getByRole('button', { name: /lock exact action/i }));
  await user.click(screen.getByRole('button', { name: /approve this exact action/i }));
  await user.click(screen.getByRole('button', { name: /confirm demo presence/i }));
  await user.click(screen.getByRole('button', { name: /complete demo action/i }));
  expect(screen.getByRole('heading', { name: /completed demo receipt/i })).toBeVisible();
  expect(screen.getByText(/no external provider was contacted/i)).toBeVisible();
});

it('fails closed when the required source is unavailable', async () => {
  const user = userEvent.setup();
  const service = createDemoAppService(`approvals-unavailable-${crypto.randomUUID()}`);
  await service.initialize();
  await service.setSourceHealth('source-email', 'temporarily-unavailable');
  render(<AppServiceProvider service={service}><MemoryRouter><ApprovalsPage /></MemoryRouter></AppServiceProvider>);

  await user.click(await screen.findByRole('button', { name: /review exact action/i }));
  await user.click(screen.getByRole('button', { name: /lock exact action/i }));
  await user.click(await screen.findByRole('button', { name: /approve this exact action/i }));
  await user.click(screen.getByRole('button', { name: /confirm demo presence/i }));
  await user.click(await screen.findByRole('button', { name: /complete demo action/i }));

  expect(await screen.findByText('Failed closed')).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(/required integration is unavailable/i);
});
