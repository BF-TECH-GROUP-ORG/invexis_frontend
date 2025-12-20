import React from "react";
import { render, screen } from "@testing-library/react";
import InventoryValueTrendSection from "../InventoryValueTrendSection";

describe("InventoryValueTrendSection", () => {
  it("renders heading and uses fallback data when none provided", () => {
    render(<InventoryValueTrendSection data={[]} />);
    expect(screen.getByText(/Inventory Value Over Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Total valuation trend/i)).toBeInTheDocument();
  });

  it("renders with provided data and shows month label", () => {
    const sample = [
      { month: "Jan", value: 100000 },
      { month: "Feb", value: 150000 },
    ];
    render(<InventoryValueTrendSection data={sample} />);
    expect(screen.getByText(/Inventory Value Over Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Jan|Feb/)).toBeTruthy();
  });
});
