import React from 'react'

const Apps = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Grid background */}
      <path
        d="M4 4H10V10H4V4ZM14 4H20V10H14V4ZM4 14H10V20H4V14ZM14 14H20V20H14V14Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
      {/* Grid accent - inner squares */}
      <path
        d="M5 5H9V9H5V5Z"
        className="fill-[#70799A] text-xl transition-all"
      />
      <path
        d="M15 5H19V9H15V5Z"
        className="fill-[#70799A] text-xl transition-all"
      />
      <path
        d="M5 15H9V19H5V15Z"
        className="fill-[#70799A] text-xl transition-all"
      />
      <path
        d="M15 15H19V19H15V15Z"
        className="fill-[#70799A] text-xl transition-all"
      />
    </svg>
  )
}

export default Apps
