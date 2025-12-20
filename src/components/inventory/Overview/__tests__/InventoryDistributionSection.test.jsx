import React from 'react';
import { render, screen } from '@testing-library/react';
import InventoryDistributionSection from '../InventoryDistributionSection';

describe('InventoryDistributionSection', () => {
  it('renders status and value distributions and totals', () => {
    const statusData = [
      { name: 'In Stock', value: 3000 },
      { name: 'Low Stock', value: 200 },
      { name: 'Out of Stock', value: 50 },
    ];

    const valueData = [
      { name: 'Electronics', value: 450000 },
      { name: 'Accessories', value: 150000 },
    ];

    render(<InventoryDistributionSection statusData={statusData} valueData={valueData} />);

    // Legend items
    expect(screen.getByText(/In Stock/i)).toBeInTheDocument();
    expect(screen.getByText(/Electronics/i)).toBeInTheDocument();

    // Total items shown in center
    expect(screen.getByText(/3,250/)).toBeInTheDocument();

    // Total value formatted approx (k)`
    expect(screen.getByText(/\$/)).toBeInTheDocument();
  });
});
