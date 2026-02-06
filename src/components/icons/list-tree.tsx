import React from 'react'

const ListTree = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tree structure lines */}
      <path
        d="M3 3V21M3 3H21M3 9H14M3 15H18"
        stroke="#C8CDD8"
        strokeWidth="2"
        strokeLinecap="round"
        className="transition-all"
      />
      {/* Nodes */}
      <path
        d="M19 3C19 4.10457 19.8954 5 21 5C22.1046 5 23 4.10457 23 3C23 1.89543 22.1046 1 21 1C19.8954 1 19 1.89543 19 3Z"
        className="fill-[#70799A] text-xl transition-all"
      />
      <path
        d="M12 9C12 10.1046 12.8954 11 14 11C15.1046 11 16 10.1046 16 9C16 7.89543 15.1046 7 14 7C12.8954 7 12 7.89543 12 9Z"
        className="fill-[#70799A] text-xl transition-all"
      />
      <path
        d="M16 15C16 16.1046 16.8954 17 18 17C19.1046 17 20 16.1046 20 15C20 13.8954 19.1046 13 18 13C16.8954 13 16 13.8954 16 15Z"
        className="fill-[#70799A] text-xl transition-all"
      />
      <path
        d="M1 21C1 22.1046 1.89543 23 3 23C4.10457 23 5 22.1046 5 21C5 19.8954 4.10457 19 3 19C1.89543 19 1 19.8954 1 21Z"
        className="fill-[#70799A] text-xl transition-all"
      />
    </svg>
  )
}

export default ListTree
