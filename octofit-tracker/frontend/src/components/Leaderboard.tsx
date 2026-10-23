import { CapabilityCard } from './CapabilityCard.js';

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      endpoint="/api/leaderboard"
      emptyText="No leaderboard"
      getItems={(payload) => (payload as { leaderboard?: Array<{ teamName?: string; totalPoints?: number; rank?: number }> } | undefined)?.leaderboard ?? []}
      renderItem={(item) => (
        <div>
          <strong>#{item.rank ?? 0}</strong> {item.teamName ?? 'Team'} — {item.totalPoints ?? 0} pts
        </div>
      )}
    />
  );
}
