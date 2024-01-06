'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const PATHS = [
  {
    path: '/posts',
    label: 'Posts',
  },
  {
    path: '/projects',
    label: 'Projects',
  },
  {
    path: '/sketchbook',
    label: 'Sketchbook',
  },
] as const;

const TopBar = () => {
  const pathname = usePathname();

  return (
    <header className="bg-white font-mono w-full h-12 flex justify-between items-center drop-shadow-md z-50 fixed top-0 p-6">
      <Link href="/">
        <h1 className="text-xl font-bold text-gray-600 hover:text-gray-800 transition-all">
          Shubidumdu
        </h1>
      </Link>
      <div className="flex gap-4">
        {PATHS.map(({ path, label }, index) => (
          <Link href={path} key={index}>
            <h2
              className={`text-l text-gray-600 hover:text-gray-800 hover:underline underline-offset-2 transition-all ${
                pathname.includes(path) ? 'text-gray-800 font-bold' : ''
              }`}
            >
              {label}
            </h2>
          </Link>
        ))}
      </div>
    </header>
  );
};

export default TopBar;
