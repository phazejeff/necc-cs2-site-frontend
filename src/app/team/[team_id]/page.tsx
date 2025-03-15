'use client'
import { useParams } from "next/navigation";
import MatchesPage from "../../MatchesPage";

export default function TeamMatchesPage() {
  const params = useParams();
  const team_id = params.team_id;

  if (!team_id || typeof team_id !== "string") return <p>Loading...</p>;

  return <MatchesPage teamId={team_id} />;
}
