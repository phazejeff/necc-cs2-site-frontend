"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import default_avatar from '../../public/default_avatar.jpg';

// Type definitions
interface Team {
  avatar: string | null;
  division: number;
  group: number;
  name: string;
  team_id: string;
}

interface Player {
  avatar: string;
  level: number;
  nickname: string;
  player_id: string;
  team: Team;
}

interface PlayerStats {
  adr: number;
  assists: number;
  damage: number;
  deaths: number;
  headshot_percentage: number;
  hltv_rating: number;
  kd_ratio: number;
  kills: number;
  mvps: number;
  player: Player;
  utility_damage: number;
}

const TopPlayersDisplay: React.FC = () => {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [visiblePlayers, setVisiblePlayers] = useState<number>(0);
  
  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        const matchId = new URLSearchParams(window.location.search).get('match_id') || '1';
        const mapNum = new URLSearchParams(window.location.search).get('map') || '0';
        let response;
        
        if (mapNum == '0') {
            response = await fetch(`${process.env.API_ROOT}/match/${matchId}/topplayers`);
        } else {
            response = await fetch(`${process.env.API_ROOT}/match/${matchId}/map/${mapNum}/topplayers`);
        }
        
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        setPlayers(data.slice(0, 5)); // Get only top 5 players
        setLoading(false);
      } catch (err) {
        setError('Failed to load player data');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchTopPlayers();
  }, []);
  
  // Animation effect for players appearing one by one
  useEffect(() => {
    if (!loading && players.length > 0) {
      const animationInterval = setInterval(() => {
        setVisiblePlayers(prev => {
          if (prev < players.length) {
            return prev + 1;
          }
          clearInterval(animationInterval);
          return prev;
        });
      }, 300); // 300ms between each player appearing
      
      return () => clearInterval(animationInterval);
    }
  }, [loading, players]);
  
  if (loading) {
    return <div className="p-6 font-sans text-white"></div>; // Start blank while loading
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-red-500 text-2xl">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="p-6 font-sans text-white">
      <div className="space-y-4">
        {players.map((player, index) => (
          <div 
            key={`player-${player.player.player_id || index}`} 
            className={`flex items-center p-3 rounded overflow-hidden transition-all duration-500 ease-in-out ${index < visiblePlayers ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}
          >
            {/* Position indicator with gradient based on position */}
            <div 
              className="w-12 h-12 flex items-center justify-center text-2xl font-bold rounded-full"
              style={{
                background: index === 0 
                  ? 'linear-gradient(135deg, #FFD700, #FFA500)' 
                  : index === 1 
                    ? 'linear-gradient(135deg, #C0C0C0, #A9A9A9)' 
                    : index === 2 
                      ? 'linear-gradient(135deg, #CD7F32, #8B4513)'
                      : 'linear-gradient(135deg, #2C3E50, #1A2530)'
              }}
            >
              {index + 1}
            </div>
            
            {/* Player avatar */}
            <div className="ml-4 relative">
              <Image 
                src={player.player.avatar != '' ? player.player.avatar : default_avatar} 
                alt={player.player.nickname}
                className="w-16 h-16 rounded-full object-cover border-2"
                width={64}
                height={64}
                style={{
                  borderColor: index === 0 
                    ? '#FFD700' 
                    : index === 1 
                      ? '#C0C0C0' 
                      : index === 2 
                        ? '#CD7F32'
                        : '#4A90E2'
                }}
              />
            </div>
            
            {/* Player name and team */}
            <div className="ml-4 flex-grow">
              <div className="text-xl font-bold">{player.player.nickname}</div>
              <div className="text-sm opacity-75">{player.player.team.name}</div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-5 gap-3 text-center">
              <div className="flex flex-col w-16">
                <span className="text-xs opacity-75">RATING</span>
                <span className="text-xl font-bold">{player.hltv_rating.toFixed(2)}</span>
              </div>
              
              <div className="flex flex-col w-16">
                <span className="text-xs opacity-75">K/D</span>
                <span className="text-xl font-bold">{player.kd_ratio.toFixed(2)}</span>
              </div>
              
              <div className="flex flex-col w-16">
                <span className="text-xs opacity-75">KILLS</span>
                <span className="text-xl font-bold">{player.kills}</span>
              </div>
              
              <div className="flex flex-col w-16">
                <span className="text-xs opacity-75">ADR</span>
                <span className="text-xl font-bold">{player.adr.toFixed(1)}</span>
              </div>
              
              <div className="flex flex-col w-16">
                <span className="text-xs opacity-75">HS%</span>
                <span className="text-xl font-bold">{Math.round(player.headshot_percentage * 100)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPlayersDisplay;