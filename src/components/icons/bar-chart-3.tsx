import React from 'react'

const BarChart3 = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Bars background */}
      <path
        d="M4 20H20V18H4V20Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
      {/* Bar 1 */}
      <path
        d="M6 10H9V17H6V10Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
      {/* Bar 2 - tallest */}
      <path
        d="M10.5 4H13.5V17H10.5V4Z"
        className="fill-[#70799A] text-xl transition-all"
      />
      {/* Bar 3 */}
      <path
        d="M15 8H18V17H15V8Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
    </svg>
  )
}

export default BarChart3
