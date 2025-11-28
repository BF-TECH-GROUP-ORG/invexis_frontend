"use client";

import React from "react";

export default function Reviews() {
  const reviews = [
    { id: "R-1001", name: "Jane", rating: 5, comment: "Great product!" },
    { id: "R-1000", name: "Bob", rating: 3, comment: "OK, expected better" },
  ];

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <div className="text-sm text-gray-500">
          Moderate and manage product reviews.
        </div>
      </header>

      <section className="p-4 bg-white rounded-xl border border-neutral-300">
        <h4 className="font-semibold mb-3">Recent reviews</h4>
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="p-3 border rounded">
              <div className="flex justify-between">
                <div className="font-semibold">{r.name}</div>
                <div className="text-sm text-gray-500">{r.rating} / 5</div>
              </div>
              <div className="text-sm text-gray-700 mt-1">{r.comment}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
