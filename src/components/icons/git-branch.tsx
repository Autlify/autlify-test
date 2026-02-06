import React from 'react'

const GitBranch = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main line */}
      <path
        d="M6 3V15M6 15C4.89543 15 4 15.8954 4 17C4 18.1046 4.89543 19 6 19C7.10457 19 8 18.1046 8 17C8 15.8954 7.10457 15 6 15ZM6 3C4.89543 3 4 3.89543 4 5C4 6.10457 4.89543 7 6 7C7.10457 7 8 6.10457 8 5C8 3.89543 7.10457 3 6 3Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
      {/* Branch line */}
      <path
        d="M18 5C18 6.10457 17.1046 7 16 7C14.8954 7 14 6.10457 14 5C14 3.89543 14.8954 3 16 3C17.1046 3 18 3.89543 18 5Z"
        className="fill-[#70799A] text-xl transition-all"
      />
      <path
        d="M16 7V10C16 11.1046 15.1046 12 14 12H8"
        stroke="#70799A"
        strokeWidth="2"
        strokeLinecap="round"
        className="transition-all"
      />
      <path
        d="M6 5V9M6 12V17"
        stroke="#C8CDD8"
        strokeWidth="2"
        strokeLinecap="round"
        className="transition-all"
      />
    </svg>
  )
}

export default GitBranch
