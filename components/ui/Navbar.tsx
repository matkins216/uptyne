import React from 'react'
import Image from 'next/image'
import logo from "@/public/logo.png";


const Navbar = () => {
  return (
      <div className="flex flex-col items-center justify-center w-screen h-20 top-0 text-center">
          <Image src="/logo.png" alt="logo" width={100} height={100} />
      </div>
  )
}

export default Navbar
