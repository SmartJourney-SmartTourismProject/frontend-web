import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SpendByCategoryPanel } from '../SpendByCategoryPanel';

describe('SpendByCategoryPanel', () => {
  it('renders the empty state when nothing has been logged yet', () => {
    render(<SpendByCategoryPanel breakdown={[]} totalSpent={0} currency="LKR" />);

    expect(screen.getByText('No expenses logged yet.')).toBeInTheDocument();
  });

  it('lists each category with its percentage and the total spent', () => {
    render(
      <SpendByCategoryPanel
        breakdown={[
          { category: 'food', amount: 3000, percentage: 60 },
          { category: 'transport', amount: 2000, percentage: 40 },
        ]}
        totalSpent={5000}
        currency="LKR"
      />,
    );

    expect(screen.getByText('food')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('transport')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('5,000')).toBeInTheDocument();
  });
});
