import React from 'react'

const CreditCard = () => {
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
      {/* Stripe */}
      <path
        d="M2 8H22V11H2V8Z"
        className="fill-[#70799A] text-xl transition-all"
      />
      {/* Bottom details */}
      <path
        d="M6 15H10V16H6V15ZM12 15H14V16H12V15Z"
        className="fill-[#70799A] text-xl transition-all"
      />
    </svg>
  )
}

export default CreditCard
