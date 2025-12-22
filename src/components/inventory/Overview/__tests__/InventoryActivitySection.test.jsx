import React from "react";
import { render, screen } from "@testing-library/react";
import InventoryActivitySection from "../InventoryActivitySection";

describe("InventoryActivitySection", () => {
  it("renders Recent Activity and New Products panels", () => {
    render(<InventoryActivitySection activities={[]} recentProducts={[]} />);
    expect(screen.getByText(/Recent Activity/i)).toBeInTheDocument();
    expect(screen.getByText(/New Products/i)).toBeInTheDocument();
  });

  it("shows provided activity rows", () => {
    const activities = [
      {
        id: "a1",
        type: "RESTOCK",
        item: "Widget",
        quantity: 10,
        time: "1h ago",
      },
    ];
    render(
      <InventoryActivitySection activities={activities} recentProducts={[]} />
    );
    expect(screen.getByText(/Widget/i)).toBeInTheDocument();
    expect(screen.getByText(/1h ago/i)).toBeInTheDocument();
  });
});
