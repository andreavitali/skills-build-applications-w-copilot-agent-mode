import { CapabilityCard } from './CapabilityCard.js';

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      endpoint="/api/teams"
      emptyText="No teams"
      getItems={(payload) => (payload as { teams?: Array<{ name?: string; members?: string[] }> } | undefined)?.teams ?? []}
      renderItem={(item) => (
        <div>
          <strong>{item.name ?? 'Team'}</strong>
          <div>{(item.members ?? []).join(', ') || 'No members'}</div>
        </div>
      )}
    />
  );
}
