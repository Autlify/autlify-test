import React from 'react'

const Sparkles = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main sparkle */}
      <path
        d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
      {/* Small sparkles */}
      <path
        d="M19 2L19.7 4.3L22 5L19.7 5.7L19 8L18.3 5.7L16 5L18.3 4.3L19 2Z"
        className="fill-[#70799A] text-xl transition-all"
      />
      <path
        d="M5 16L5.5 17.5L7 18L5.5 18.5L5 20L4.5 18.5L3 18L4.5 17.5L5 16Z"
        className="fill-[#70799A] text-xl transition-all"
      />
    </svg>
  )
}

export default Sparkles
