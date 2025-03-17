"use client"
import { Suspense } from "react";
import SeasonRankings from "../SeasonRankings";
import { useSearchParams } from "next/navigation";

const Rankings = () => {
  const searchParams = useSearchParams()
  const division = searchParams.get('division') ?? "1";
  const group = searchParams.get('group') ?? "1";
  return <SeasonRankings division={division} group={group}/>;
}

export default function RankingsPage() {
  return (
    <Suspense>
      <Rankings />
    </Suspense>
  );
}