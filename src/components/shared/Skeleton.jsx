"use client";

import React from "react";

/**
 * A flexible Skeleton component for loading states.
 * 
 * @param {string} className - Additional CSS classes for styling (width, height, etc.)
 * @param {string} variant - 'rectangle' (default), 'circle', or 'text'
 * @param {boolean} animate - Whether to show the pulse animation (default: true)
 */
export default function Skeleton({
    className = "",
    variant = "rectangle",
    animate = true
}) {
    const baseClasses = "bg-gray-200 dark:bg-gray-700";
    const animationClass = animate ? "animate-pulse" : "";

    let variantClasses = "";
    if (variant === "circle") {
        variantClasses = "rounded-full";
    } else if (variant === "text") {
        variantClasses = "rounded h-4 w-full";
    } else {
        variantClasses = "rounded-2xl"; // Matching the user's image rounded corners
    }

    return (
        <div
            className={`${baseClasses} ${animationClass} ${variantClasses} ${className}`}
            aria-hidden="true"
        />
    );
}
