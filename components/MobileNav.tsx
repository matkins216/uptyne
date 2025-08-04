"use client"
import Link from 'next/link';
import { useState } from 'react';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="md:hidden bg-white shadow-md">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold underline">Uptyne</h2>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-col gap-1 p-2"
        >
          <span className={`w-6 h-0.5 bg-gray-600 transition-transform ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-gray-600 transition-opacity ${isOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-gray-600 transition-transform ${isOpen ? '-rotate-45 -translate-y-1 w-1' : ''}`}></span>
        </button>
      </div>
      {isOpen && (
        <div className="border-t bg-white">
          <div className="flex flex-col p-4 space-y-2">
            <Link href="/dashboard" className="px-3 py-2 hover:bg-gray-100 rounded">Home</Link>
            <Link href="/dashboard/monitors" className="px-3 py-2 hover:bg-gray-100 rounded">Monitors</Link>
            <Link href="/dashboard/settings" className="px-3 py-2 hover:bg-gray-100 rounded">Settings</Link>
            <Link href="/logout" className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600">Logout</Link>
          </div>
        </div>
      )}
    </nav>
  );
}