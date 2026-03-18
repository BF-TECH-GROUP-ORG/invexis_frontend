"use client";

import React, { useRef, useState, useEffect } from "react";

const PinInput = ({ length = 6, value, onChange, disabled = false }) => {
  const [digits, setDigits] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  // Sync internal digits with external value (for auto-fill)
  useEffect(() => {
    if (value && value.length === length) {
      setDigits(value.split(""));
    }
  }, [value, length]);

  const handleChange = (index, val) => {
    if (!/^\d*$/.test(val)) return; // Only numbers

    const newDigits = [...digits];
    newDigits[index] = val.slice(-1); // Only keep the last character
    setDigits(newDigits);
    onChange(newDigits.join(""));

    // Move to next input if filled
    if (val && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    const newDigits = pastedData.split("");
    const paddedDigits = [...newDigits, ...Array(length - newDigits.length).fill("")].slice(0, length);
    setDigits(paddedDigits);
    onChange(paddedDigits.join(""));
    
    // Focus last filled input or the first empty one
    const nextIndex = Math.min(newDigits.length, length - 1);
    inputRefs.current[nextIndex].focus();
  };

  return (
    <div className="flex justify-between gap-2 md:gap-4 my-4" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i]}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold border-2 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 disabled:opacity-50"
        />
      ))}
    </div>
  );
};

export default PinInput;
