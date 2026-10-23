import { CapabilityCard } from './CapabilityCard.js';

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      endpoint="/api/workouts/suggestions/mona@example.com"
      emptyText="No workout suggestions"
      getItems={(payload) => (payload as { suggestions?: Array<{ title?: string; reason?: string; focus?: string }> } | undefined)?.suggestions ?? []}
      renderItem={(item) => (
        <div>
          <strong>{item.title ?? 'Workout'}</strong>
          {item.focus ? <div>{item.focus}</div> : null}
          {item.reason ? <div>{item.reason}</div> : null}
        </div>
      )}
    />
  );
}
