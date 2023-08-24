import Link from 'next/link'
import React from 'react'

const TopBar = () => {
  return (
    <header className='bg-white font-mono w-full h-12 flex justify-center items-center drop-shadow-md z-50 fixed top-0'>
      <Link href='/'>
        <h1 className="text-xl text-gray-600 hover:text-gray-800 transition-all">
          Shubidumdu&apos;s Devlog
        </h1>
      </Link>
    </header>
  )
}

export default TopBar