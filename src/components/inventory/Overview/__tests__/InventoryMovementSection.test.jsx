import React from "react";
import { render, screen } from "@testing-library/react";
import InventoryMovementSection from "../InventoryMovementSection";

describe("InventoryMovementSection", () => {
  it("renders heading and does not crash with empty data", () => {
    render(<InventoryMovementSection data={[]} />);
    expect(screen.getByText(/Inventory Movement Trend/i)).toBeInTheDocument();
  });

  it("renders with sample data and shows month label", () => {
    const sample = [
      { month: "Jan", stockIn: 100, stockOut: 50, netChange: 50 },
      { month: "Feb", stockIn: 200, stockOut: 150, netChange: 50 },
    ];
    render(<InventoryMovementSection data={sample} />);
    expect(screen.getByText(/Inventory Movement Trend/i)).toBeInTheDocument();
    // XAxis label appears as text nodes; ensure a month label is present
    expect(screen.getByText(/Jan|Feb/)).toBeTruthy();
  });
});
