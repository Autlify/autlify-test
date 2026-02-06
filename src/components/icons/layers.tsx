import React from 'react'

const Layers = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bottom layer */}
      <path
        d="M12 22L2 17L12 12L22 17L12 22Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
      {/* Middle layer */}
      <path
        d="M12 17L2 12L12 7L22 12L12 17Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
      {/* Top layer */}
      <path
        d="M12 12L2 7L12 2L22 7L12 12Z"
        className="fill-[#70799A] text-xl transition-all"
      />
    </svg>
  )
}

export default Layers
