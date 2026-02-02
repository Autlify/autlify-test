import React from 'react'

const Rocket = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Rocket body */}
      <path
        d="M12 2C12 2 8.5 6 8.5 12C8.5 14 9 16 10 18L12 22L14 18C15 16 15.5 14 15.5 12C15.5 6 12 2 12 2Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
      {/* Fins */}
      <path
        d="M5 14L8.5 12V16L5 18V14ZM19 14L15.5 12V16L19 18V14Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
      {/* Window accent */}
      <path
        d="M12 8C13.1046 8 14 8.89543 14 10C14 11.1046 13.1046 12 12 12C10.8954 12 10 11.1046 10 10C10 8.89543 10.8954 8 12 8Z"
        className="fill-[#70799A] text-xl transition-all"
      />
      {/* Flame */}
      <path
        d="M10.5 18L12 22L13.5 18H10.5Z"
        className="fill-[#70799A] text-xl transition-all"
      />
    </svg>
  )
}

export default Rocket
