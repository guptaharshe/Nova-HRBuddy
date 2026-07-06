import React from 'react';

/**
 * Input component per UI_DESIGN.md §5:
 * Single style for email, password, and chat text entry.
 * Focus state: 1px teal border, no glow.
 */
function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 text-input text-[#111111] bg-white border border-border rounded-md
        placeholder:text-muted hover:bg-teal-light
        focus:outline-none focus:border-teal focus:ring-0 focus:bg-white
        transition-colors duration-150
        ${className}`}
      {...props}
    />
  );
}

export default Input;
