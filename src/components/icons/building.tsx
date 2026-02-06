import React from 'react'

const Building = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main building */}
      <path
        d="M5 2H19C20.1046 2 21 2.89543 21 4V22H3V4C3 2.89543 3.89543 2 5 2Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
      {/* Windows */}
      <path
        d="M7 6H10V9H7V6ZM14 6H17V9H14V6ZM7 11H10V14H7V11ZM14 11H17V14H14V11ZM10 17H14V22H10V17Z"
        className="fill-[#70799A] text-xl transition-all"
      />
    </svg>
  )
}

export default Building
