import React from "react";
import { render, screen } from "@testing-library/react";
import ProductRiskSection from "../ProductRiskSection";

describe("ProductRiskSection", () => {
  it("renders both panels with empty lists", () => {
    render(<ProductRiskSection topProducts={[]} riskProducts={[]} />);
    expect(screen.getByText(/Stockout Risks/i)).toBeInTheDocument();
    expect(screen.getByText(/Top Performers/i)).toBeInTheDocument();
  });

  it("renders rows with provided data", () => {
    const risk = [
      { id: "r1", name: "Gadget", stock: 5, burnRate: 2, remainingDays: 2 },
    ];
    const tops = [{ id: "t1", name: "Widget", unitsSold: 100, profit: 5000 }];
    render(<ProductRiskSection topProducts={tops} riskProducts={risk} />);
    expect(screen.getByText(/Gadget/i)).toBeInTheDocument();
    expect(screen.getByText(/Widget/i)).toBeInTheDocument();
  });
});
