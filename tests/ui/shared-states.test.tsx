import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import type { AppService } from '../../src/domain/contracts';
import { AppServiceProvider } from '../../src/app/AppServiceProvider';
import { Badge } from '../../src/ui/Badge';
import { Button } from '../../src/ui/Button';
import { ConfidenceBar } from '../../src/ui/ConfidenceBar';
import { CoverageNotice } from '../../src/ui/CoverageNotice';
import { EmptyState } from '../../src/ui/EmptyState';
import { LoadingState } from '../../src/ui/LoadingState';
import { Modal } from '../../src/ui/Modal';

it('labels missing coverage without implying customer inactivity', () => {
  render(<CoverageNotice source="Email" health="temporarily-unavailable" />);

  expect(screen.getByText(/email is temporarily unavailable/i)).toBeVisible();
  expect(screen.queryByText(/no reply/i)).not.toBeInTheDocument();
});

it('exposes confidence as a labeled progress value', () => {
  render(<ConfidenceBar value={86} label="Evidence confidence" />);

  expect(screen.getByRole('progressbar', { name: 'Evidence confidence' })).toHaveAttribute(
    'aria-valuenow',
    '86',
  );
  expect(screen.getByText('86%')).toBeVisible();
});

it('keeps empty and loading states productive and accessible', () => {
  const { rerender } = render(
    <EmptyState
      title="No decisions need approval"
      description="New proposals will appear here for exact-action review."
      action={<Button>Add a manual task</Button>}
    />,
  );

  expect(screen.getByRole('button', { name: 'Add a manual task' })).toBeVisible();

  rerender(<LoadingState label="Loading account evidence" />);
  expect(screen.getByRole('status')).toHaveTextContent('Loading account evidence');
});

it('renders a dismissible modal and semantic badge', async () => {
  const user = userEvent.setup();
  let closed = false;

  render(
    <>
      <Badge tone="warning">Founder approval required</Badge>
      <Modal title="Review exact action" open onClose={() => { closed = true; }}>
        Payload preview
      </Modal>
    </>,
  );

  expect(screen.getByText('Founder approval required')).toBeVisible();
  expect(screen.getByRole('dialog', { name: 'Review exact action' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Close dialog' }));
  expect(closed).toBe(true);
});

it('retries persistence initialization without resetting local work', async () => {
  const user = userEvent.setup();
  const service = {
    initialize: vi.fn()
      .mockRejectedValueOnce(new Error('IndexedDB unavailable'))
      .mockResolvedValueOnce(undefined),
    resetDemoData: vi.fn(),
  } as unknown as AppService;

  render(
    <AppServiceProvider service={service}>
      <div>Workspace ready</div>
    </AppServiceProvider>,
  );

  expect(await screen.findByRole('alert')).toHaveTextContent(/local workspace could not be opened/i);
  expect(service.resetDemoData).not.toHaveBeenCalled();

  await user.click(screen.getByRole('button', { name: /retry local workspace/i }));
  expect(await screen.findByText('Workspace ready')).toBeVisible();
  expect(service.initialize).toHaveBeenCalledTimes(2);
  expect(service.resetDemoData).not.toHaveBeenCalled();
});
