"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { AuthScreen } from '@/components/auth/auth-screen';
import { Dashboard } from '@/components/dashboard/dashboard';
import { authClient, useSession } from '@/lib/auth-client';
import { workspaceRequest, type Workspace } from '@/lib/api';
import type { Tour, TeamTour } from '@/types/trip';

function Loading({ message }: { message: string }) { return <main className="grid min-h-svh place-items-center px-6 text-center text-gold">{message}</main>; }

function UserWorkspace({ user }: { user: { id: string; name: string; email: string; image?: string | null } }) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [teamTours, setTeamTours] = useState<TeamTour[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState('');
  const revision = useRef(0);
  const saved = useRef('');
  const latest = useRef({ tours, teamTours });
  const running = useRef(false);
  const mounted = useRef(true);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    let active = true;
    workspaceRequest('GET').then(data => {
      if (!active) return;
      revision.current = data.revision;
      saved.current = JSON.stringify({ tours: data.tours, teamTours: data.teamTours });
      latest.current = { tours: data.tours, teamTours: data.teamTours };
      setTours(data.tours); setTeamTours(data.teamTours); setLoaded(true);
    }).catch(err => { if (active) setError(err instanceof Error ? err.message : 'Could not load your tours.'); });
    return () => { active = false; };
  }, []);

  async function saveChanges() {
    if (running.current || !loaded) return;
    running.current = true; setSaving(true); setError('');
    try {
      while (mounted.current) {
        const snapshot = latest.current;
        const serialized = JSON.stringify(snapshot);
        if (serialized === saved.current) break;
        const data: Workspace = await workspaceRequest('PUT', { ...snapshot, revision: revision.current });
        revision.current = data.revision;
        saved.current = serialized;
      }
    } catch (err) { if (mounted.current) setError(err instanceof Error ? err.message : 'Changes could not be saved.'); }
    finally { running.current = false; if (mounted.current) setSaving(false); }
  }
  useEffect(() => {
    latest.current = { tours, teamTours };
    if (loaded && JSON.stringify(latest.current) !== saved.current && !error) void saveChanges();
    // Data changes trigger one serialized save queue; revision lives in a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tours, teamTours, loaded]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (running.current || (loaded && JSON.stringify(latest.current) !== saved.current)) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [loaded]);
  const appState = useMemo(() => ({ tours, setTours, teamTours, setTeamTours }), [tours, teamTours]);

  if (!loaded) return error ? <main className="grid min-h-svh place-items-center p-6"><div className="app-card p-6"><p role="alert">{error}</p><button className="mt-4 text-gold" onClick={() => window.location.reload()}>Retry loading</button></div></main> : <Loading message="Loading your tours..."/>;
  return <>
    <Dashboard appState={appState} currentUser={user} onLogout={() => {
      if (running.current || JSON.stringify(latest.current) !== saved.current) { setAuthError('Please save your changes before signing out.'); return; }
      void authClient.signOut().then(result => { if (result.error) setAuthError(result.error.message || 'Sign out failed.'); }).catch(() => setAuthError('Unable to sign out. Please try again.'));
    }}/>
    {authError && <button role="alert" className="fixed left-1/2 top-3 z-50 w-[calc(100%-32px)] max-w-[448px] -translate-x-1/2 rounded-xl bg-panel p-3 text-sm text-danger" onClick={() => setAuthError('')}>{authError} · Dismiss</button>}
    {saving && <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/60"><p role="status" className="app-card p-5 text-gold">Saving changes...</p></div>}
    {error && <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/90 p-6"><div className="app-card max-w-sm p-5"><h2 className="font-bold">Changes are not saved</h2><p role="alert" className="mt-3 text-sm text-danger">{error}</p><div className="mt-4 flex flex-wrap gap-4"><button className="text-gold" onClick={() => void saveChanges()}>Retry save</button><button className="text-goldSoft" onClick={() => { if (window.confirm('Discard unsaved changes and load the last saved data?')) window.location.reload(); }}>Reload saved data</button></div></div></div>}
  </>;
}
export default function HomePage() {
  const { data: session, isPending, error, refetch } = useSession();
  if (isPending) return <Loading message="Checking your session..."/>;
  if (error) return <main className="grid min-h-svh place-items-center p-6"><div className="app-card p-6"><p role="alert">Unable to check your session. Make sure the backend is running.</p><button className="mt-4 text-gold" onClick={() => void refetch()}>Retry</button></div></main>;
  if (!session) return <AuthScreen onSuccess={() => { void refetch(); }}/>;
  return <UserWorkspace key={session.user.id} user={session.user}/>;
}
