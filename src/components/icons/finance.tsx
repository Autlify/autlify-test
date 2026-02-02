import React from 'react'

const Finance = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main building/bank shape */}
      <path
        d="M3 21H21V19H3V21ZM3 10H21V8L12 3L3 8V10ZM5 12V17H9V12H5ZM10 12V17H14V12H10ZM15 12V17H19V12H15Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
      {/* Pillars accent */}
      <path
        d="M12 3L3 8V10H21V8L12 3Z"
        className="fill-[#70799A] text-xl transition-all"
      />
      <path
        d="M6 12H8V17H6V12ZM11 12H13V17H11V12ZM16 12H18V17H16V12Z"
        className="fill-[#70799A] text-xl transition-all"
      />
    </svg>
  )
}

export default Finance
