import React from 'react'

const ImageIcon = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Frame */}
      <path
        d="M4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
      {/* Sun/circle */}
      <path
        d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
        className="fill-[#70799A] text-xl transition-all"
      />
      {/* Mountain */}
      <path
        d="M22 18L17 12L13 17L9 13L2 20H22V18Z"
        className="fill-[#70799A] text-xl transition-all"
      />
    </svg>
  )
}

export default ImageIcon
