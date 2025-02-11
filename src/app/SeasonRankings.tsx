"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Trophy } from 'lucide-react';

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

const SeasonRankings = () => {
  const [groups, setGroups] = useState<number>(0);
  const [rankings, setRankings] = useState<{ [key: string]: Team[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch group amount
        const groupResponse = await fetch(`${process.env.API_ROOT}/groupamount`);
        const groupData = await groupResponse.json();
        setGroups(groupData.count);

        // Fetch rankings for each group
        const rankingsData: { [key: string]: Team[] } = {};
        for (let i = 1; i <= groupData.count; i++) {
          const response = await fetch(`${process.env.API_ROOT}/seasonrankings/${i}`);
          const data = await response.json();
          rankingsData[i] = data;
        }
        setRankings(rankingsData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch rankings data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading rankings...</p>
      </div>
    );
  }

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
      <Tabs defaultValue="1">
        <TabsList className="mb-4">
          {Array.from({ length: groups }, (_, i) => i + 1).map((group) => (
            <TabsTrigger key={group} value={group.toString()}>
              Group {group}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(rankings).map(([group, teams]) => (
          <TabsContent key={group} value={group}>
            <Card>
              <CardHeader>
                <CardTitle>Group {group} Rankings</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex flex-col">
                    <span>Tiebreakers go as follows, whichever breaks the tie first: Total match wins, Map win differential, Round win differential, head-to-head record</span>
                    <span>Top 4 teams go to playoffs</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teams.map((team, index) => (
                    <Card key={team.team_id} className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8">
                          {index === 0 && <Trophy className="text-yellow-500" size={24} />}
                          {index === 1 && <Trophy className="text-gray-400" size={24} />}
                          {(index === 2 || index === 3) && <Trophy className="text-amber-600" size={24} />}
                          {index > 3 && <span className="text-lg font-bold">{index + 1}</span>}
                        </div>
                        
                        <div className="flex-grow">
                          <h3 className="text-lg font-semibold">{team.name}</h3>
                          <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                            <div>
                              <p className="font-medium">Matches</p>
                              <p>{team.record.matches.won}W - {team.record.matches.lost}L</p>
                              <p className="text-gray-500">
                                {getWinRate(team.record.matches.won, team.record.matches.lost)}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium">Maps</p>
                              <p>{team.record.maps.won}W - {team.record.maps.lost}L</p>
                              <p className="text-gray-500">
                                Diff: {getWinDiff(team.record.maps.won, team.record.maps.lost)}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium">Rounds</p>
                              <p>{team.record.rounds.won}W - {team.record.rounds.lost}L</p>
                              <p className="text-gray-500">
                                Diff: {getWinDiff(team.record.rounds.won, team.record.rounds.lost)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SeasonRankings;