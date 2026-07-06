import React from 'react';

/**
 * Button component with two variants per UI_DESIGN.md §5:
 * - primary: teal fill, white text (default)
 * - secondary: white fill, gray border, dark text (e.g. logout)
 */
function Button({ children, variant = 'primary', disabled = false, className = '', ...props }) {
  const base = 'px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-1';

  const variants = {
    primary: `bg-teal text-white hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed`,
    secondary: `bg-white text-[#111111] border border-border hover:bg-surface disabled:opacity-50`,
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
