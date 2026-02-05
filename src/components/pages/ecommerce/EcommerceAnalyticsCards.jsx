"use client";

import React from "react";

export default function EcommerceAnalyticsCards({
  cards = [],
  onFilter = () => {},
  activeFilters = {},
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const active =
          card.key &&
          ((card.key === "total" &&
            !activeFilters.role &&
            !activeFilters.status) ||
            (card.key === "low_stock" &&
              activeFilters.status === "low_stock") ||
            (card.key === "backorders" &&
              activeFilters.status === "backorders"));

        return (
          <div
            key={card.key}
            role="button"
            tabIndex={0}
            onClick={() => onFilter(card.key)}
            className={`border-2 rounded-2xl p-5 bg-white hover:border-[#ff782d] transition-all cursor-pointer ${
              active ? "border-[#ff782d]" : "border-[#d1d5db]"
            }`}
            style={{ boxShadow: 'none' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6b7280] font-medium mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-[#081422] mb-2">
                  {card.value}
                </p>
                {card.description && (
                  <p className="text-xs text-[#9ca3af]">{card.description}</p>
                )}
              </div>
              {card.icon && (
                <div
                  className="p-3 rounded-xl shrink-0"
                  style={{ backgroundColor: card.bgColor }}
                >
                  <Icon size={24} style={{ color: card.color }} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
