"use client";

import { ChevronRight, Plus, X } from "lucide-react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { AppButton } from "@/components/common/button";
import { createId, formatBDT, formatTourDate, getMemberPaid } from "@/lib/utils";
import type { TeamTour, Tour } from "@/types/trip";

export function TeamAccountsPage({
  teams,
  tours = [],
  setTeams,
  onOpenTeam
}: {
  teams: TeamTour[];
  tours?: Tour[];
  setTeams: Dispatch<SetStateAction<TeamTour[]>>;
  onOpenTeam: (teamId: string) => void;
}) {
  const [formOpen, setFormOpen] = useState(false);

  const createTeam = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    if (!name) return;

    setTeams((current) => [{ id: createId("team"), tourId: String(form.get("tourId") || "") || undefined, name, createdAt: new Date().toISOString(), members: [] }, ...current]);
    setFormOpen(false);
  };

  return (
    <section className="min-h-svh px-7 pb-28 pt-10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-black text-gold">Tour Teams</p>
          <h1 className="mt-1 text-4xl font-black">Team Accounts</h1>
        </div>
        <p className="pt-10 text-xl font-black">BDT</p>
      </div>

      <div className="mt-8 space-y-5">
        {teams.map((team) => {
          const totalPaid = team.members.reduce((sum, member) => sum + getMemberPaid(member), 0);
          return (
            <button key={team.id} type="button" onClick={() => onOpenTeam(team.id)} className="app-card w-full p-5 text-left">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-black text-gold">Tour Team</p>
                  <h2 className="mt-1 text-3xl font-black">{team.name}</h2>
                  <p className="mt-2 text-sm font-black text-gold">{team.members.length} members</p>
                </div>
                <ChevronRight className="rounded-full bg-ink p-2 text-milk" size={46} />
              </div>
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-sm font-black text-gold">Total Paid</p>
                  <p className="text-4xl font-light">{formatBDT(totalPaid)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gold">Created</p>
                  <p className="text-sm font-black">{formatTourDate(team.createdAt)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {typeof document !== "undefined" && createPortal(formOpen ? (
        <form
          onSubmit={createTeam}
          className="fixed bottom-28 left-1/2 z-40 w-[calc(100%-32px)] max-w-[448px] -translate-x-1/2 rounded-[24px] border border-gold/35 bg-panel/95 p-4 shadow-card backdrop-blur"
        >
          <input name="name" className="field" placeholder="Tour name" autoFocus />
          <select name="tourId" className="field mt-3" defaultValue="">
            <option value="">Standalone team</option>
            {tours.filter(tour => (tour.status ?? "active") === "active").map(tour => <option key={tour.id} value={tour.id}>{tour.name}</option>)}
          </select>
          <div className="mt-3 flex items-center justify-end gap-2">
          <AppButton type="submit" className="px-4 py-3">
            Save
          </AppButton>
          <AppButton type="button" tone="ghost" className="grid h-11 w-11 place-items-center p-0" onClick={() => setFormOpen(false)}>
            <X size={18} />
          </AppButton>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          aria-label="Create team"
          className="fixed bottom-28 right-[max(28px,calc((100vw-480px)/2+28px))] z-40 grid h-16 w-16 place-items-center rounded-full bg-gold text-ink shadow-glow"
        >
          <Plus size={30} strokeWidth={3} />
        </button>
      ), document.body)}
    </section>
  );
}
