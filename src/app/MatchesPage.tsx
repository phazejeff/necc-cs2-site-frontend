"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Clock, Users, X, Check } from 'lucide-react';
import { format, parse } from 'date-fns';

interface Team {
  avatar: string | null;
  division: number;
  group: number;
  name: string;
  team_id: string;
}

interface Map {
  map: string;
  map_id: string;
  map_num: number;
  match_id: string;
  team1_first_half_score: number;
  team1_overtime_score: number;
  team1_score: number;
  team1_second_half_score: number;
  team2_first_half_score: number;
  team2_overtime_score: number;
  team2_score: number;
  team2_second_half_score: number;
  winner: string;
}

interface Match {
  finished_at: string;
  maps: Map[];
  match_id: string;
  team1: Team;
  team2: Team;
  url: string;
  week: number;
  winner: string;
}

interface MatchesPageProps {
  teamId?: string;
}

const MatchesPage = ({ teamId }: MatchesPageProps) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string>("");

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        // Use the provided teamId or a demo ID if none provided
        const id = teamId || "5447a36a-40de-458b-9ab3-3f5eb94f1295";
        const response = await fetch(`${process.env.API_ROOT}/matches/${id}`);
        const data = await response.json();
        setMatches(data);
        
        // Set team name from the first match
        if (data.length > 0) {
          const team = data[0].team1.team_id === id ? data[0].team1 : data[0].team2;
          setTeamName(team.name);
        }
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch match history');
        setLoading(false);
      }
    };

    fetchMatches();
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading match history...</p>
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

  const formatDate = (dateString: string) => {
    const date = parse(dateString, "EEE, dd MMM yyyy HH:mm:ss 'GMT'", new Date());
    return format(date, 'MMM d, yyyy');
  };

  // Group matches by week
  const matchesByWeek: { [key: number]: Match[] } = {};
  matches.forEach(match => {
    if (!matchesByWeek[match.week]) {
      matchesByWeek[match.week] = [];
    }
    matchesByWeek[match.week].push(match);
  });

  // Sort weeks in descending order (most recent first)
  const sortedWeeks = Object.keys(matchesByWeek)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">{teamName} Match History</CardTitle>
        </CardHeader>
      </Card>

      {sortedWeeks.map(week => (
        <Card key={week} className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2" size={20} />
              Week {week}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {matchesByWeek[week].map(match => {
                // Determine if this team is team1 or team2
                const isTeam1 = teamId ? match.team1.team_id === teamId : true;
                const thisTeam = isTeam1 ? match.team1 : match.team2;
                const opposingTeam = isTeam1 ? match.team2 : match.team1;
                const didWin = match.winner === thisTeam.team_id;
                const isForfeit = match.maps.length === 0;

                return (
                  <Card key={match.match_id} className={`p-4 border-l-4 ${didWin ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div className="flex items-center">
                        <div className="mr-3">
                          {didWin ? 
                            <Check className="text-green-500" size={24} /> : 
                            <X className="text-red-500" size={24} />
                          }
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {thisTeam.name} vs {opposingTeam.name}
                          </h3>
                          <div className="flex flex-wrap items-center text-sm text-gray-600 gap-4 mt-1">
                            <div className="flex items-center">
                              <Clock size={16} className="mr-1" />
                              {formatDate(match.finished_at)}
                            </div>
                            <div className="flex items-center">
                              <Users size={16} className="mr-1" />
                              Division {thisTeam.division}, Group {thisTeam.group}
                            </div>
                            {isForfeit && (
                              <div className="text-orange-500 font-medium">
                                Forfeit by {didWin ? opposingTeam.name : thisTeam.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-2 md:mt-0">
                        <a 
                          href={match.url.replace('{lang}', 'en')} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          Faceit Details →
                        </a>
                      </div>
                    </div>

                    {!isForfeit && (
                      <div className="space-y-4">
                        {match.maps.map((map, index) => {
                          const team1Score = map.team1_score;
                          const team2Score = map.team2_score;
                          const thisTeamScore = isTeam1 ? team1Score : team2Score;
                          const opposingTeamScore = isTeam1 ? team2Score : team1Score;
                          const mapWinner = map.winner === thisTeam.team_id;

                          return (
                            <div key={map.map_id} className="bg-gray-50 dark:bg-zinc-900 p-3 rounded-md">
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <MapPin size={16} className="mr-1" />
                                  <span className="font-medium">Map {index + 1}: {map.map}</span>
                                </div>
                                <div className={`font-bold ${mapWinner ? 'text-green-600' : 'text-red-600'}`}>
                                  {thisTeamScore} - {opposingTeamScore}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="font-medium">First Half</p>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    {isTeam1 ? map.team1_first_half_score : map.team2_first_half_score} - {isTeam1 ? map.team2_first_half_score : map.team1_first_half_score}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium">Second Half</p>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    {isTeam1 ? map.team1_second_half_score : map.team2_second_half_score} - {isTeam1 ? map.team2_second_half_score : map.team1_second_half_score}
                                  </p>
                                </div>
                                {(map.team1_overtime_score > 0 || map.team2_overtime_score > 0) && (
                                  <div>
                                    <p className="font-medium">Overtime</p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                      {isTeam1 ? map.team1_overtime_score : map.team2_overtime_score} - {isTeam1 ? map.team2_overtime_score : map.team1_overtime_score}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MatchesPage;