import React from "react";
import { render, screen } from "@testing-library/react";
import ShopPerformanceSection from "../ShopPerformanceSection";

describe("ShopPerformanceSection", () => {
  it("renders heading and handles empty data", () => {
    render(<ShopPerformanceSection data={[]} />);
    expect(screen.getByText(/Shop Performance/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Revenue vs Inventory Volume/i)
    ).toBeInTheDocument();
  });

  it("renders provided shop names", () => {
    const data = [
      { name: "Store A", revenue: 10000, units: 500 },
      { name: "Store B", revenue: 20000, units: 1000 },
    ];
    render(<ShopPerformanceSection data={data} />);
    expect(screen.getByText(/Store A|Store B/)).toBeTruthy();
  });
});
