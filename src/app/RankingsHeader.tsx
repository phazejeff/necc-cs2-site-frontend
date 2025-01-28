"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

const RankingsHeader = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="w-full bg-background sticky top-0 z-50 border-b">
      <div className="container mx-auto">
        <div className="flex h-16 items-center px-4">
          <nav className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/rankings')}
              className={`px-4 py-2 rounded-md transition-colors ${
                pathname === '/rankings'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              Season Rankings
            </button>
            <button
              onClick={() => router.push('/rankings/nationals')}
              className={`px-4 py-2 rounded-md transition-colors ${
                pathname === '/rankings/nationals'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              National Rankings
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default RankingsHeader;