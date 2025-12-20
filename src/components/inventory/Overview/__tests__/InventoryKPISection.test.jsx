import React from "react";
import { render, screen } from "@testing-library/react";
import InventoryKPISection from "../InventoryKPISection";

describe("InventoryKPISection", () => {
  it("renders KPI cards with computed values and formatted currency", () => {
    const summary = {
      summaryComputed: {
        totalValue: 1234567.89,
        totalUnits: 5000,
        lowStockCount: 2,
        netStockMovement: -10,
      },
    };

    const sparklines = {
      value: Array.from({ length: 10 }).map((_, i) => ({ value: i * 10 })),
      units: Array.from({ length: 10 }).map((_, i) => ({ value: i })),
      risk: Array.from({ length: 10 }).map(() => ({ value: 0 })),
      movement: Array.from({ length: 10 }).map(({ value } = {}) => ({
        value: 0,
      })),
    };

    render(<InventoryKPISection summary={summary} sparklines={sparklines} />);

    // Check total inventory value shows formatted currency
    expect(screen.getByText(/Total Inventory Value/i)).toBeInTheDocument();
    expect(screen.getByText(/\$1,234,567.89/)).toBeInTheDocument();

    // Check total units
    expect(screen.getByText(/Total Units/i)).toBeInTheDocument();
    expect(screen.getByText(/5,000/)).toBeInTheDocument();

    // Low stock
    expect(screen.getByText(/Low Stock Items/i)).toBeInTheDocument();
    expect(screen.getByText(/2/)).toBeInTheDocument();

    // Net movement
    expect(screen.getByText(/Net Movement/i)).toBeInTheDocument();
    expect(screen.getByText(/-10/)).toBeInTheDocument();
  });
});
