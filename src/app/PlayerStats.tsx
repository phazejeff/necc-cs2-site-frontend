"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronUp, ChevronDown, Medal } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import default_avatar from '../../public/default_avatar.jpg';

interface Player {
  avatar: string;
  nickname: string;
  player_id: string;
  team_name: string;
  team_id: string;
  rating: number;
  total_kills: number;
  total_deaths: number;
  total_assists: number;
  total_headshots: number;
  avg_headshot_percentage: number;
  total_damage: number;
  avg_adr: number;
  total_mvps: number;
  // Advanced stats
  avg_flash_success_rate: number;
  avg_utility_damage_per_round: number;
  avg_match_entry_rate: number;
  avg_match_entry_success_rate: number;
  total_clutch_kills: number;
  total_double_kills: number;
  total_triple_kills: number;
  total_quadro_kills: number;
  total_penta_kills: number;
  total_sniper_kills: number;
  total_pistol_kills: number;
  avg_enemies_flashed_per_round: number;
  avg_flashes_per_round: number;
  avg_match_one_v_one_win_rate: number;
  avg_match_one_v_two_win_rate: number;
  avg_sniper_kill_rate: number;
  avg_sniper_kill_rate_per_round: number;
  avg_utility_damage_success_rate: number;
  avg_utility_success_rate: number;
  avg_utility_usage_per_round: number;
  total_enemies_flashed: number;
  total_entry_count: number;
  total_entry_wins: number;
  total_first_kills: number;
  total_flash_count: number;
  total_flash_successes: number;
  total_one_v_one_count: number;
  total_one_v_one_wins: number;
  total_one_v_two_count: number;
  total_one_v_two_wins: number;
  total_knife_kills: number;
  total_zeus_kills: number;
  total_utility_count: number;
  total_utility_enemies: number;
  total_utility_successes: number;
  
  division: number;
  group: number;
  [key: string]: string | number | undefined;
}

const PlayerAvatar: React.FC<{ avatar: string; nickname: string; defaultAvatar: string }> = ({
  avatar,
  nickname,
  defaultAvatar,
}) => {
  const [imgSrc, setImgSrc] = useState(avatar || defaultAvatar);

  return (
    <Image
      src={imgSrc}
      blurDataURL={defaultAvatar}
      alt={`${nickname}'s avatar`}
      width={32}
      height={32}
      className="rounded-full"
      onError={() => {
        if (imgSrc !== defaultAvatar) {
          setImgSrc(defaultAvatar);
        }
      }}
    />
  );
};

const PlayerStats: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showExtendedStats, setShowExtendedStats] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentTab, setCurrentTab] = useState<string>("main");

  // States for filters
  const [divisions, setDivisions] = useState<number[]>([]);
  const [groups, setGroups] = useState<number[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<number>(0); // 0 means All Divisions
  const [selectedGroup, setSelectedGroup] = useState<number>(0); // 0 means All Groups

  // Fetch the total number of divisions when component mounts
  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const res = await fetch(`${process.env.API_ROOT}/divisionamount`);
        const data = await res.json();
        const divisionNumbers = Array.from({ length: data.count }, (_, i) => i + 1);
        setDivisions(divisionNumbers);
      } catch (err) {
        console.error('Failed to fetch divisions', err);
      }
    };
    fetchDivisions();
  }, []);

  // Fetch groups when selectedDivision changes
  useEffect(() => {
    if (selectedDivision === 0) {
      setGroups([]);
      setSelectedGroup(0);
      return;
    }
    const fetchGroups = async () => {
      try {
        const res = await fetch(`${process.env.API_ROOT}/groupamount/${selectedDivision}`);
        const data = await res.json();
        const groupNumbers = Array.from({ length: data.count }, (_, i) => i + 1);
        setGroups(groupNumbers);
        setSelectedGroup(0);
      } catch (err) {
        console.error('Failed to fetch groups', err);
      }
    };
    fetchGroups();
  }, [selectedDivision]);

  // Fetch players when filters change
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        let url = `${process.env.API_ROOT}/stats/topplayers`;

        if (selectedDivision !== 0) {
          url = `${process.env.API_ROOT}/stats/topplayers/division/${selectedDivision}`;
          if (selectedGroup !== 0) {
            url = `${process.env.API_ROOT}/stats/topplayers/division/${selectedDivision}/group/${selectedGroup}`;
          }
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch player data');
        }
        const data = await response.json();
        setPlayers(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [selectedDivision, selectedGroup]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const valueA = a[sortBy];
    const valueB = b[sortBy];
    
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    }
    
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortOrder === "asc" 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    }
    
    return 0;
  });

  const SortableHeader: React.FC<{ column: string, label: string }> = ({ column, label }) => (
    <th 
      onClick={() => handleSort(column)}
      className="p-3 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <div className="flex items-center gap-1">
        {label}
        {sortBy === column && (
          <span>
            {sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        )}
      </div>
    </th>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Filter Dropdowns */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <Label htmlFor="division-select" className="block mb-1">Division</Label>
          <select
            id="division-select"
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(Number(e.target.value))}
            className="border rounded p-2 bg-white text-black dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
          >
            <option value={0}>All Divisions</option>
            {divisions.map((div) => (
              <option key={div} value={div}>
                Division {div}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="group-select" className="block mb-1">Group</Label>
          <select
            id="group-select"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(Number(e.target.value))}
            className="border rounded p-2 bg-white text-black dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedDivision === 0 || groups.length === 0}
          >
            <option value={0}>All Groups</option>
            {groups.map((grp) => (
              <option key={grp} value={grp}>
                Group {grp}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsContent value={currentTab}>
          <Card>
            <CardHeader>
              <CardTitle>Regular Season Statistics</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex flex-col">
                  <span>
                    Rating is a rough estimation of HLTV rating based on{" "}
                    <Link
                      href={'https://www.hltv.org/forums/threads/2433094/rating-20'}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='underline'
                    >
                      Brasil&apos;s Formula
                    </Link>
                  </span>
                  <span>Do not take it as an accurate representation of overall skill</span>
                  <span>Playoff games not included here</span>
                  <span>Click on column headers to sort</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                {/* Custom-styled Switch with dark mode support */}
                <Switch
                  id="extended-stats"
                  checked={showExtendedStats}
                  onCheckedChange={setShowExtendedStats}
                  className={`${
                    showExtendedStats
                      ? 'bg-blue-600 dark:bg-blue-500'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span className="sr-only">Show Advanced Statistics</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      showExtendedStats ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </Switch>
                <Label htmlFor="extended-stats">Show Advanced Statistics</Label>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <p className="text-lg">Loading player statistics...</p>
                </div>
              ) : (
                <div className="overflow-x-auto rotate-180">
                  <table className="w-full rotate-180">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th className="p-3 text-left">Rank</th>
                        <th className="p-3 text-left">Player</th>
                        <th className="p-3 text-left">Team</th>
                        <th className="p-3 text-left">Division</th>
                        <SortableHeader column="rating" label="Rating" />
                        <SortableHeader column="total_kills" label="Kills" />
                        <SortableHeader column="total_deaths" label="Deaths" />
                        <SortableHeader column="total_assists" label="Assists" />
                        <SortableHeader column="avg_headshot_percentage" label="HS%" />
                        <SortableHeader column="avg_adr" label="ADR" />
                        <SortableHeader column="total_mvps" label="MVPs" />
                        
                        {showExtendedStats && currentTab === "main" && (
                          <>
                            <SortableHeader column="total_clutch_kills" label="Clutch Kills" />
                            <SortableHeader column="avg_match_entry_rate" label="Entry Rate" />
                            <SortableHeader column="avg_match_entry_success_rate" label="Entry Success" />
                            <SortableHeader column="total_double_kills" label="Double Kills" />
                            <SortableHeader column="total_triple_kills" label="Triple Kills" />
                            <SortableHeader column="total_quadro_kills" label="Quadro Kills" />
                            <SortableHeader column="total_penta_kills" label="Penta Kills" />
                            <SortableHeader column="total_sniper_kills" label="Sniper Kills" />
                            <SortableHeader column="total_pistol_kills" label="Pistol Kills" />
                            <SortableHeader column="avg_utility_damage_per_round" label="Util Dmg/Round" />
                            <SortableHeader column="avg_flash_success_rate" label="Flash Success" />
                            <SortableHeader column="total_utility_damage" label="Total Util Dmg" />
                            <SortableHeader column="avg_enemies_flashed_per_round" label="Avg Enemies Flashed/Rnd" />
                            <SortableHeader column="avg_flashes_per_round" label="Avg Flashes/Rnd" />
                            <SortableHeader column="avg_match_one_v_one_win_rate" label="1v1 Win Rate" />
                            <SortableHeader column="avg_match_one_v_two_win_rate" label="1v2 Win Rate" />
                            <SortableHeader column="avg_sniper_kill_rate" label="Avg Sniper Kill Rate" />
                            <SortableHeader column="avg_sniper_kill_rate_per_round" label="Sniper Kill Rate/Rnd" />
                            <SortableHeader column="avg_utility_damage_success_rate" label="Util Dmg Success Rate" />
                            <SortableHeader column="avg_utility_success_rate" label="Util Success Rate" />
                            <SortableHeader column="avg_utility_usage_per_round" label="Util Usage/Rnd" />
                            <SortableHeader column="total_enemies_flashed" label="Total Enemies Flashed" />
                            <SortableHeader column="total_entry_count" label="Total Entry Count" />
                            <SortableHeader column="total_entry_wins" label="Total Entry Wins" />
                            <SortableHeader column="total_first_kills" label="Total First Kills" />
                            <SortableHeader column="total_flash_count" label="Total Flash Count" />
                            <SortableHeader column="total_flash_successes" label="Total Flash Successes" />
                            <SortableHeader column="total_headshots" label="Total Headshots" />
                            <SortableHeader column="total_damage" label="Total Damage" />
                            <SortableHeader column="total_one_v_one_count" label="1v1 Count" />
                            <SortableHeader column="total_one_v_one_wins" label="1v1 Wins" />
                            <SortableHeader column="total_one_v_two_count" label="1v2 Count" />
                            <SortableHeader column="total_one_v_two_wins" label="1v2 Wins" />
                            <SortableHeader column="total_knife_kills" label="Knife Kills" />
                            <SortableHeader column="total_zeus_kills" label="Zeus Kills" />
                            <SortableHeader column="total_utility_count" label="Utility Count" />
                            <SortableHeader column="total_utility_enemies" label="Utility Enemies" />
                            <SortableHeader column="total_utility_successes" label="Utility Successes" />
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPlayers.map((player, index) => (
                        <tr key={player.player_id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-3">
                            {index === 0 && <Medal className="text-yellow-500" size={20} />}
                            {index === 1 && <Medal className="text-gray-400" size={20} />}
                            {index === 2 && <Medal className="text-amber-700" size={20} />}
                            {index > 2 && index + 1}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <PlayerAvatar 
                                avatar={player.avatar}
                                nickname={player.nickname}
                                defaultAvatar={default_avatar.src}
                              />
                              <span>{player.nickname}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <Link href={`/team/${player.team_id}`}>
                              <span className="hover:underline cursor-pointer">{player.team_name}</span>
                            </Link>
                          </td>
                          <td className="p-3"><span>{player.division}</span></td>
                          <td className="p-3 font-bold">{player.rating.toFixed(2)}</td>
                          <td className="p-3">{player.total_kills}</td>
                          <td className="p-3">{player.total_deaths}</td>
                          <td className="p-3">{player.total_assists}</td>
                          <td className="p-3">{player.avg_headshot_percentage.toFixed(1)}%</td>
                          <td className="p-3">{player.avg_adr.toFixed(1)}</td>
                          <td className="p-3">{player.total_mvps}</td>
                          
                          {showExtendedStats && currentTab === "main" && (
                            <>
                              <td className="p-3">{player.total_clutch_kills}</td>
                              <td className="p-3">{(player.avg_match_entry_rate * 100).toFixed(1)}%</td>
                              <td className="p-3">{(player.avg_match_entry_success_rate * 100).toFixed(1)}%</td>
                              <td className="p-3">{player.total_double_kills}</td>
                              <td className="p-3">{player.total_triple_kills}</td>
                              <td className="p-3">{player.total_quadro_kills}</td>
                              <td className="p-3">{player.total_penta_kills}</td>
                              <td className="p-3">{player.total_sniper_kills}</td>
                              <td className="p-3">{player.total_pistol_kills}</td>
                              <td className="p-3">{player.avg_utility_damage_per_round.toFixed(1)}</td>
                              <td className="p-3">{(player.avg_flash_success_rate * 100).toFixed(1)}%</td>
                              <td className="p-3">{player.total_utility_damage}</td>
                              <td className="p-3">{player.avg_enemies_flashed_per_round.toFixed(2)}</td>
                              <td className="p-3">{player.avg_flashes_per_round.toFixed(2)}</td>
                              <td className="p-3">{(player.avg_match_one_v_one_win_rate * 100).toFixed(1)}%</td>
                              <td className="p-3">{(player.avg_match_one_v_two_win_rate * 100).toFixed(1)}%</td>
                              <td className="p-3">{player.avg_sniper_kill_rate.toFixed(2)}</td>
                              <td className="p-3">{player.avg_sniper_kill_rate_per_round.toFixed(2)}</td>
                              <td className="p-3">{player.avg_utility_damage_success_rate.toFixed(1)}%</td>
                              <td className="p-3">{(player.avg_utility_success_rate * 100).toFixed(1)}%</td>
                              <td className="p-3">{player.avg_utility_usage_per_round.toFixed(2)}</td>
                              <td className="p-3">{player.total_enemies_flashed}</td>
                              <td className="p-3">{player.total_entry_count}</td>
                              <td className="p-3">{player.total_entry_wins}</td>
                              <td className="p-3">{player.total_first_kills}</td>
                              <td className="p-3">{player.total_flash_count}</td>
                              <td className="p-3">{player.total_flash_successes}</td>
                              <td className="p-3">{player.total_headshots}</td>
                              <td className="p-3">{player.total_damage}</td>
                              <td className="p-3">{player.total_one_v_one_count}</td>
                              <td className="p-3">{player.total_one_v_one_wins}</td>
                              <td className="p-3">{player.total_one_v_two_count}</td>
                              <td className="p-3">{player.total_one_v_two_wins}</td>
                              <td className="p-3">{player.total_knife_kills}</td>
                              <td className="p-3">{player.total_zeus_kills}</td>
                              <td className="p-3">{player.total_utility_count}</td>
                              <td className="p-3">{player.total_utility_enemies}</td>
                              <td className="p-3">{player.total_utility_successes}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlayerStats;
