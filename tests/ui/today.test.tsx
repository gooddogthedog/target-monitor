import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TodayPage } from '../../src/features/today/TodayPage';

it('shows one dominant action with rationale, evidence, confidence, gate effect, approval, and after-this queue', () => {
  render(
    <MemoryRouter>
      <TodayPage />
    </MemoryRouter>,
  );

  expect(screen.getByRole('heading', { name: /your next best move/i })).toBeVisible();
  expect(screen.getByRole('heading', { name: /turn the asset-data hypothesis/i })).toBeVisible();
  expect(screen.getByLabelText(/why this outranks other work/i)).toBeVisible();
  expect(screen.getByText(/supporting evidence/i)).toBeVisible();
  expect(screen.getByRole('progressbar', { name: /evidence confidence/i })).toHaveAttribute(
    'aria-valuenow',
    '86',
  );
  expect(screen.getByText(/account thesis → contacted/i)).toBeVisible();
  expect(screen.getByText(/requires founder approval/i)).toBeVisible();
  expect(screen.getByRole('heading', { name: /after this/i })).toBeVisible();
  expect(screen.getAllByTestId('next-action')).toHaveLength(3);
});
