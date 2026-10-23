import { CapabilityCard } from './CapabilityCard.js';

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      endpoint="/api/activities"
      emptyText="No activities"
      getItems={(payload) => (payload as { activities?: Array<{ type?: string; minutes?: number; points?: number }> } | undefined)?.activities ?? []}
      renderItem={(item) => (
        <div>
          <strong>{item.type ?? 'Activity'}</strong>
          <span> · {item.minutes ?? 0} minutes · {item.points ?? 0} pts</span>
        </div>
      )}
    />
  );
}
