import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppServiceProvider } from '../../src/app/AppServiceProvider';
import { createDemoAppService } from '../../src/application/demoAppService';
import { PipelinePage } from '../../src/features/pipeline/PipelinePage';

function renderPipeline() {
  const service = createDemoAppService(`pipeline-ui-${crypto.randomUUID()}`);
  return render(<AppServiceProvider service={service}><MemoryRouter><PipelinePage /></MemoryRouter></AppServiceProvider>);
}

it('explains blocked progress and requires every accountability field for an override', async () => {
  const user = userEvent.setup();
  renderPipeline();

  expect(await screen.findByText(/movement is earned by evidence/i)).toBeVisible();
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

it('binds an override to the account whose gate was reviewed', async () => {
  const user = userEvent.setup();
  renderPipeline();
  await screen.findByText(/movement is earned by evidence/i);
  await user.click(screen.getByRole('button', { name: /review H-E-B blocked gate/i }));
  await user.click(screen.getByRole('button', { name: /override with accountability/i }));
  const dialog = screen.getByRole('dialog', { name: /accountable override · H-E-B/i });
  expect(dialog).toBeVisible();
  expect(within(dialog).getByText(/commissioning owner unknown/i)).toBeVisible();
});

it('filters the portfolio and exposes the full advancement requirements', async () => {
  const user = userEvent.setup();
  renderPipeline();
  await screen.findByText(/movement is earned by evidence/i);

  expect(screen.getByRole('button', { name: 'Active' })).toHaveAttribute('aria-pressed', 'true');
  await user.click(screen.getByRole('button', { name: 'Needs review' }));
  const matrix = screen.getByLabelText(/account progress matrix/i);
  expect(within(matrix).queryByText('RaceTrac')).not.toBeInTheDocument();
  expect(within(matrix).getByText('H-E-B')).toBeVisible();
  expect(within(matrix).getByText('Bagel Brands')).toBeVisible();

  for (const artifact of ['External Target Brief', 'Deal Thesis', 'Qualification Scorecard']) {
    expect(screen.getByText(artifact)).toBeVisible();
  }
  expect(screen.getByRole('button', { name: /review advancement/i })).toBeVisible();
});
