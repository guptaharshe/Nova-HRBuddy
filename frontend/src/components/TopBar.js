import React from 'react';
import Button from './Button';

/**
 * TopBar per UI_DESIGN.md §4.2:
 * - White bg, bottom 1px border
 * - Left: "HRBuddy" wordmark + small teal dot
 * - Right: user name + designation (muted) + plain "Log out" button
 */
function TopBar({ userName, userDesignation, onLogout, onMenuToggle }) {
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 bg-transparent border-b-2 border-teal-light/60">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu */}
        <button 
          onClick={onMenuToggle}
          className="sm:hidden p-1 mr-1 text-[#111111] hover:text-teal-dark hover:bg-teal-light/50 rounded transition-colors"
          aria-label="Toggle Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-teal hidden sm:inline-block"></span>
        <span className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight truncate">NovaTech - HRBuddy</span>
      </div>
      <div className="flex items-center gap-4">
        {userName && (
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-[#111111]">{userName}</div>
            <div className="text-xs text-teal-dark opacity-75">{userDesignation}</div>
          </div>
        )}
        <Button variant="primary" onClick={onLogout} className="flex items-center gap-2 px-3 py-1.5 text-sm">
          Log out
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </Button>
      </div>
    </div>
  );
}

export default TopBar;
