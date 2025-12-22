import React from "react";
import { render, screen } from "@testing-library/react";
import InventoryInsightsSection from "../InventoryInsightsSection";

describe("InventoryInsightsSection", () => {
  it("renders heatmap and profit panels with fallbacks", () => {
    render(<InventoryInsightsSection financialData={[]} heatmapData={[]} />);
    expect(screen.getByText(/Activity Heatmap/i)).toBeInTheDocument();
    expect(screen.getByText(/Profit & Cost Analysis/i)).toBeInTheDocument();
  });

  it("renders with provided financial data", () => {
    const financial = [
      { month: "Jan", revenue: 1000, cost: 500 },
      { month: "Feb", revenue: 2000, cost: 1000 },
    ];
    render(
      <InventoryInsightsSection
        financialData={financial}
        heatmapData={Array.from({ length: 28 }).map(() => 10)}
      />
    );
    expect(screen.getByText(/Profit & Cost Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Jan|Feb/)).toBeTruthy();
  });
});
