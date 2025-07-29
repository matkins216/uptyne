"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import logo from "@/public/logo.png";


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
      <div className="flex flex-row justify-between items-center w-full top-0">
          <Image src="/logo.png" alt="logo" width={100} height={100} />
          
          {/* Desktop Menu */}
          <div className="hidden md:flex flex-row items-center justify-center gap-10">
              <a href="/" className="text-blue-500 hover:text-blue-700">Home</a>
              <a href="/login" className="text-blue-500 hover:text-blue-700">Login</a>
              <a href="/register" className="text-blue-500 hover:text-blue-700">Register</a>
          </div>

          {/* Hamburger Button */}
          <button 
            className="md:hidden flex flex-col gap-1 p-5 "
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className={`w-6 h-0.5 bg-blue-500 transition-transform ${isOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-blue-500 transition-opacity ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-blue-500 transition-transform ${isOpen ? '-rotate-45 -translate-y-2 w-1' : ''}`}></span>
          </button>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="absolute top-24 left-0 w-full bg-white shadow-lg md:hidden">
              <div className="flex flex-col p-4 gap-4">
                <a href="/" className="text-blue-500 hover:text-blue-700">Home</a>
                <a href="/login" className="text-blue-500 hover:text-blue-700">Login</a>
                <a href="/register" className="text-blue-500 hover:text-blue-700">Register</a>
              </div>
            </div>
          )}
      </div>
  )
}

export default Navbar
