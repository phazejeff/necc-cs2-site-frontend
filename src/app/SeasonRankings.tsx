"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Trophy } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

interface TeamRecord {
  maps: { won: number; lost: number };
  matches: { won: number; lost: number };
  rounds: { won: number; lost: number };
}

interface Team {
  avatar: string | null;
  group: number;
  name: string;
  record: TeamRecord;
  team_id: string;
}

interface SeasonRankingsProps {
  division: string;
  group: string;
}

const SeasonRankings = ({ division, group }: SeasonRankingsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [divisions, setDivisions] = useState<number>(0);
  const [groupsByDivision, setGroupsByDivision] = useState<{ [key: string]: number }>({});
  const [currentDivision, setCurrentDivision] = useState(division);
  const [currentGroup, setCurrentGroup] = useState(group);
  const [rankings, setRankings] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
  
      return params.toString();
    },
    [searchParams]
  )

  function changeDivision(division: string) {
    router.push(pathname + '?' + createQueryString('division', division))
    setCurrentDivision(division)
  }

  function changeGroup(group: string) {
    router.push(pathname + '?' + createQueryString('group', group))
    setCurrentGroup(group)
  }

  // Fetch division and group counts on initial load
  useEffect(() => {
    const fetchStructure = async () => {
      try {
        // Fetch division amount
        const divisionResponse = await fetch(`${process.env.API_ROOT}/divisionamount`);
        const divisionData = await divisionResponse.json();
        setDivisions(divisionData.count);

        // Fetch group amount for the first division
        const groupResponse = await fetch(`${process.env.API_ROOT}/groupamount/${currentDivision}`);
        const groupData = await groupResponse.json();
        setGroupsByDivision(prev => ({
          ...prev,
          [currentDivision]: groupData.count
        }));
      } catch (err) {
        console.error(err);
        setError('Failed to fetch structure data');
      }
    };

    fetchStructure();
  }, [currentDivision]);

  // Fetch rankings when division or group changes
  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.API_ROOT}/seasonrankings/division/${currentDivision}/group/${currentGroup}`);
        const data = await response.json();
        setRankings(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch rankings data');
      }
      setLoading(false);
    };

    if (currentDivision && currentGroup) {
      fetchRankings();
    }
  }, [currentDivision, currentGroup]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  const getWinRate = (won: number, lost: number) => {
    const total = won + lost;
    if (total === 0) return '0%';
    return `${((won / total) * 100).toFixed(1)}%`;
  };

  const getWinDiff = (won: number, lost: number) => {
    return `${won - lost}`;
  }

  return (
    <div className="container mx-auto p-4">
      <Suspense>
        <Tabs value={currentDivision} onValueChange={changeDivision} className="space-y-4">
          <TabsList className="mb-4">
            {Array.from({ length: divisions }, (_, i) => i + 1).map((division) => (
              <TabsTrigger key={`div-${division}`} value={division.toString()}>
                Division {division}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={currentDivision}>
            <Tabs value={currentGroup} onValueChange={changeGroup} className="space-y-4">
              <TabsList className="mb-4">
                {groupsByDivision[currentDivision] && Array.from(
                  { length: groupsByDivision[currentDivision] },
                  (_, i) => i + 1
                ).map((group) => (
                  <TabsTrigger key={`group-${group}`} value={group.toString()}>
                    Group {group}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={currentGroup}>
                <Card>
                  <CardHeader>
                    <CardTitle>Division {currentDivision} - Group {currentGroup} Rankings</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex flex-col">
                        <span>Tiebreakers go as follows, whichever breaks the tie first: Total match wins, Map win differential, Round win differential, head-to-head record</span>
                        {Number(currentDivision) === 1 && <span>Top 2 teams go to playoffs</span>}
                        {Number(currentDivision) !== 1 && <span>Top 4 teams go to playoffs</span>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <p className="text-lg">Loading rankings...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {rankings.map((team, index) => (
                          <Card key={team.team_id} className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0 w-8">
                                {index === 0 && <Trophy className="text-yellow-500" size={24} />}
                                {index === 1 && <Trophy className="text-gray-400" size={24} />}
                                {index === 2 && Number(currentDivision) !== 1 && <Trophy className="text-amber-600" size={24} />}
                                {index === 3 && Number(currentDivision) !== 1 && <Trophy className="text-amber-800" size={24} />}
                                {(index > 3 || (Number(currentDivision) === 1 && index > 1)) && <span className="text-lg font-bold">{index + 1}</span>}
                              </div>
                              
                              <div className="flex-grow">
                                <Link href={`/team/${team.team_id}`}>
                                  <h3 className="text-lg font-semibold hover:underline cursor-pointer">{team.name}</h3>
                                </Link>
                                <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                                  <div>
                                    <p className="font-medium">Matches</p>
                                    <p>{team.record.matches.won}W - {team.record.matches.lost}L</p>
                                    <p className="text-gray-500 dark:text-gray-400">
                                      {getWinRate(team.record.matches.won, team.record.matches.lost)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Maps</p>
                                    <p>{team.record.maps.won}W - {team.record.maps.lost}L</p>
                                    <p className="text-gray-500 dark:text-gray-400">
                                      Diff: {getWinDiff(team.record.maps.won, team.record.maps.lost)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Rounds</p>
                                    <p>{team.record.rounds.won}W - {team.record.rounds.lost}L</p>
                                    <p className="text-gray-500 dark:text-gray-400">
                                      Diff: {getWinDiff(team.record.rounds.won, team.record.rounds.lost)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </Suspense>
    </div>
  );
};

export default SeasonRankings;