import React from 'react'

const Contact = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Card body */}
      <path
        d="M4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
      {/* Avatar circle */}
      <path
        d="M8 10C8 8.89543 8.89543 8 10 8C11.1046 8 12 8.89543 12 10C12 11.1046 11.1046 12 10 12C8.89543 12 8 11.1046 8 10Z"
        className="fill-[#70799A] text-xl transition-all"
      />
      {/* Avatar body */}
      <path
        d="M6 16C6 14.3431 7.34315 13 9 13H11C12.6569 13 14 14.3431 14 16V17H6V16Z"
        className="fill-[#70799A] text-xl transition-all"
      />
      {/* Lines */}
      <path
        d="M16 9H19M16 12H19M16 15H18"
        stroke="#70799A"
        strokeWidth="2"
        strokeLinecap="round"
        className="transition-all"
      />
    </svg>
  )
}

export default Contact
