import React from 'react'

const Users = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background people */}
      <path
        d="M16 4C17.6569 4 19 5.34315 19 7C19 8.65685 17.6569 10 16 10C15.4477 10 14.9297 9.8559 14.4827 9.60422C15.1133 8.86987 15.5 7.9259 15.5 6.89474C15.5 5.9636 15.1798 5.10585 14.6387 4.41935C15.0504 4.15088 15.5395 4 16 4Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
      <path
        d="M17 21V19C17 17.6938 16.1652 16.5825 15 16.1707V14.0554C16.4915 14.2018 17.7922 14.9333 18.6845 16.0241C19.4949 17.013 20 18.2881 20 19.5V21H17Z"
        className="fill-[#C8CDD8] text-xl transition-all"
      />
      {/* Main person */}
      <path
        d="M8 4C9.65685 4 11 5.34315 11 7C11 8.65685 9.65685 10 8 10C6.34315 10 5 8.65685 5 7C5 5.34315 6.34315 4 8 4Z"
        className="fill-[#70799A] text-xl transition-all"
      />
      <path
        d="M8 12C5.23858 12 3 14.2386 3 17V21H13V17C13 14.2386 10.7614 12 8 12Z"
        className="fill-[#70799A] text-xl transition-all"
      />
    </svg>
  )
}

export default Users
