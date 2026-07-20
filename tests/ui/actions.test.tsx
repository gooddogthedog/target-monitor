import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ActionsPage } from '../../src/features/actions/ActionsPage';

it('filters the priority ledger and records a reasoned manual pin', async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <ActionsPage />
    </MemoryRouter>,
  );

  expect(screen.getAllByTestId('priority-action')).toHaveLength(5);
  await user.click(screen.getByRole('button', { name: 'Approvals' }));
  expect(screen.getAllByTestId('priority-action')).toHaveLength(2);

  await user.click(screen.getByRole('button', { name: 'All' }));
  await user.click(screen.getByRole('button', { name: 'Pin RaceTrac action' }));
  expect(screen.getByRole('button', { name: 'Save pin' })).toBeDisabled();
  await user.type(screen.getByLabelText('Reason for pinning'), 'Founder priority');
  await user.click(screen.getByRole('button', { name: 'Save pin' }));
  expect(screen.getByText('Pinned: Founder priority')).toBeVisible();
});
