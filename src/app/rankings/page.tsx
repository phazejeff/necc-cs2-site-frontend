"use client"
import { Suspense } from "react";
import SeasonRankings from "../SeasonRankings";
import { useSearchParams } from "next/navigation";

export default function RankingsPage() {
  const searchParams = useSearchParams()
  const division = searchParams.get('division') ?? "1";
  const group = searchParams.get('group') ?? "1";
  return (
    <Suspense>
      <SeasonRankings division={division} group={group}/>
    </Suspense>
  );
}