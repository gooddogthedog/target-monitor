import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PipelinePage } from '../../src/features/pipeline/PipelinePage';

it('explains blocked progress and requires every accountability field for an override', async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <PipelinePage />
    </MemoryRouter>,
  );

  expect(screen.getByText(/movement is earned by evidence/i)).toBeVisible();
  expect(screen.getByText(/3 of 4 complete/i)).toBeVisible();
  expect(screen.getAllByText(/buyer path not selected/i).length).toBeGreaterThan(0);

  await user.click(screen.getByRole('button', { name: /review RaceTrac blocked gate/i }));
  await user.click(screen.getByRole('button', { name: /override with accountability/i }));

  const recordOverride = screen.getByRole('button', { name: /record override/i });
  expect(recordOverride).toBeDisabled();

  await user.type(screen.getByLabelText(/override reason/i), 'Founder accepts buyer uncertainty.');
  await user.type(screen.getByLabelText(/accountable owner/i), 'Caleb');
  await user.click(screen.getByRole('checkbox', { name: /acknowledge the risk/i }));
  expect(recordOverride).toBeEnabled();

  await user.click(recordOverride);
  expect(screen.getByText(/override recorded by Caleb/i)).toBeVisible();
});

