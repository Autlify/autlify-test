import React from 'react'

const Dashboard = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main layout panels */}
      <path
        d="M3 3H11V13H3V3ZM13 3H21V9H13V3ZM13 11H21V21H13V11ZM3 15H11V21H3V15Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
      {/* Panel accents */}
      <path
        d="M4 4H10V12H4V4Z"
        className="fill-[#70799A] text-xl transition-all"
      />
      <path
        d="M14 12H20V20H14V12Z"
        className="fill-[#70799A] text-xl transition-all"
      />
    </svg>
  )
}

export default Dashboard
