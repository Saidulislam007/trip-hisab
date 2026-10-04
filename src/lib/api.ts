import type { Tour, TeamTour } from '@/types/trip';
export type Workspace = { revision: number; tours: Tour[]; teamTours: TeamTour[] };
export async function workspaceRequest(method: 'GET' | 'PUT', data?: Workspace): Promise<Workspace> {
  const response = await fetch('/api/v1/workspace', {
    method, credentials: 'include', cache: 'no-store',
    headers: data ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Unable to connect to the server.');
  return result;
}
