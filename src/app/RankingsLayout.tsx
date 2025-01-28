"use client";

import React from 'react';
import RankingsHeader from './RankingsHeader';

interface RankingsLayoutProps {
  children: React.ReactNode;
}

const RankingsLayout = ({ children }: RankingsLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <RankingsHeader />
      <main className="pt-4">
        {children}
      </main>
    </div>
  );
};

export default RankingsLayout;