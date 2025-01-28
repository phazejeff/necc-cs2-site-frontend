"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Trophy } from 'lucide-react';

interface Team {
  avatar: string | null;
  group: number;
  name: string;
  team_id: string;
}

interface NationalRanking {
  fall_playoff_placement: number;
  fall_season_placement: number;
  spring_playoff_placement: number;
  spring_season_placement: number;
  id: number;
  national_points: number;
  team: Team;
  team_id: string;
}

const NationalRankings = () => {
  const [rankings, setRankings] = useState<NationalRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hideQualified, setHideQualified] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `http://127.0.0.1:5000/nationals${hideQualified ? '?ignoreQualified=true' : ''}`;
        const response = await fetch(url);
        const data = await response.json();
        setRankings(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch national rankings data');
        setLoading(false);
      }
    };

    fetchData();
  }, [hideQualified]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading national rankings...</p>
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

  const getPlacementText = (placement: number) => {
    if (placement === 0) return '-';
    return placement;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="hide-qualified"
            checked={hideQualified}
            onCheckedChange={setHideQualified}
          />
          <Label htmlFor="hide-qualified">Hide Qualified Teams</Label>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>National Points Standings</CardTitle>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Trophy className="text-yellow-500" size={20} />
            <span>Teams with gold trophy have automatically qualified for nationals</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rankings.map((ranking, index) => (
              <Card key={ranking.team_id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8">
                    {(ranking.fall_playoff_placement === 1 || ranking.spring_playoff_placement === 1) && <Trophy className="text-yellow-500" size={24} />}
                  </div>
                  <div className="flex-shrink-0 w-8">
                    {index + 1}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">{ranking.team.name}</h3>
                      <div className="text-xl font-bold text-blue-600">
                        {ranking.national_points} pts
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Fall Season</p>
                        <p className="text-gray-600">
                          Placement: {getPlacementText(ranking.fall_season_placement)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Fall Playoffs</p>
                        <p className="text-gray-600">
                          Placement: {getPlacementText(ranking.fall_playoff_placement)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Spring Season</p>
                        <p className="text-gray-600">
                          Placement: {getPlacementText(ranking.spring_season_placement)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Spring Playoffs</p>
                        <p className="text-gray-600">
                          Placement: {getPlacementText(ranking.spring_playoff_placement)}
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
    </div>
  );
};

export default NationalRankings;