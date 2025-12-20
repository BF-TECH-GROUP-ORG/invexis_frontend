import React from "react";
import { render, screen } from "@testing-library/react";
import InventoryHealthSection from "../InventoryHealthSection";

describe("InventoryHealthSection", () => {
  it("renders heading and default chart when no data", () => {
    render(<InventoryHealthSection data={[]} />);
    expect(screen.getByText(/Stock Status History/i)).toBeInTheDocument();
    expect(screen.getByText(/Historical view/i)).toBeInTheDocument();
  });

  it("renders with provided data", () => {
    const sample = [{ month: "Jan", inStock: 10, lowStock: 2, outOfStock: 1 }];
    render(<InventoryHealthSection data={sample} />);
    expect(screen.getByText(/Stock Status History/i)).toBeInTheDocument();
    expect(screen.getByText(/Jan/)).toBeTruthy();
  });
});
