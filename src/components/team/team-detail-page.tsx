"use client";

import { ArrowLeft, ChevronRight, Plus } from "lucide-react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { AppButton } from "@/components/common/button";
import { Sheet } from "@/components/common/sheet";
import { maxMemberImageSize } from "@/lib/data";
import { createId, formatBDT, getInitials, getMemberPaid, readImageFile } from "@/lib/utils";
import type { TeamTour } from "@/types/trip";

export function TeamDetailPage({
  team,
  readOnly = false,
  setTeams,
  onBack,
  onOpenMember
}: {
  team: TeamTour;
  readOnly?: boolean;
  setTeams: Dispatch<SetStateAction<TeamTour[]>>;
  onBack: () => void;
  onOpenMember: (memberId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  const addMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (readOnly || imageLoading) return;
    setError("");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const amount = Number(form.get("amount") ?? 0);
    const file = form.get("image");
    if (!name || !Number.isFinite(amount) || amount < 0) return;

    try {
      const image = file instanceof File && file.size ? await readImageFile(file, maxMemberImageSize) : "";
      setTeams((current) =>
        current.map((item) =>
          item.id === team.id
            ? {
                ...item,
                members: [
                  {
                    id: createId("member"),
                    tourId: team.tourId,
                    name,
                    image,
                    payments: amount > 0 ? [{ tourId: team.tourId, id: createId("payment"), amount, note: "First payment", date: new Date().toISOString() }] : []
                  },
                  ...item.members
                ]
              }
            : item
        )
      );
      setOpen(false);
      setImagePreview("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    }
  };

  return (
    <section className="min-h-svh px-7 pb-28 pt-10">
      <div className="mb-8 flex items-center justify-between">
        <AppButton tone="ghost" onClick={onBack}>
          <span className="inline-flex items-center gap-2">
            <ArrowLeft size={18} /> Back
          </span>
        </AppButton>
        <p className="font-black">{team.name}</p>
      </div>

      <div className="app-card p-5">
        <p className="text-sm font-black text-gold">Active Team</p>
        <h1 className="mt-2 text-4xl font-black">{team.name}</h1>
      </div>

      <div className="mt-5 space-y-5">
        {team.members.length ? (
          team.members.map((member) => (
            <button key={member.id} type="button" onClick={() => onOpenMember(member.id)} className="app-card w-full p-4 text-left">
              <div className="flex items-center gap-4">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="h-20 w-20 rounded-3xl object-cover ring-1 ring-gold/30" />
                ) : (
                  <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gold text-2xl font-black text-ink">
                    {getInitials(member.name)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-2xl font-black">{member.name}</h2>
                  <p className="mt-1 text-sm font-black text-gold">Paid amount</p>
                  <p className="text-2xl font-light">{formatBDT(getMemberPaid(member))}</p>
                </div>
                <ChevronRight className="rounded-full bg-panelSoft p-2 text-goldSoft" size={42} />
              </div>
            </button>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-gold/30 bg-panel p-5 text-center text-sm font-bold text-gold">
            No team members added yet.
          </div>
        )}
      </div>

      {typeof document !== "undefined" && !open && !readOnly ? createPortal(
        <button
          type="button"
          aria-label="Add member"
          onClick={() => { setImagePreview(""); setError(""); setOpen(true); }}
          className="fixed bottom-28 right-[max(28px,calc((100vw-480px)/2+28px))] z-40 grid h-16 w-16 place-items-center rounded-full bg-gold text-ink shadow-glow"
        >
          <Plus size={30} strokeWidth={3} />
        </button>
      , document.body) : null}

      {readOnly ? <p className="mt-5 text-sm text-gold">Archived tour: reopen it to change member payments.</p> : null}
      <Sheet open={open && !readOnly} title="Add Member" label={team.name} onClose={() => { setOpen(false); setImagePreview(""); }}>
        <form onSubmit={addMember} className="space-y-3">
          <input name="name" className="field" placeholder="Member name" required />
          <input name="amount" type="number" min={0} className="field" placeholder="Paid amount" required />
          <label className="block rounded-2xl border border-dashed border-gold/30 bg-[#202a46] p-4 text-sm font-black text-goldSoft">
            Upload profile image
            <span className="mt-1 block text-xs text-gold">PNG, JPEG, WebP, GIF, AVIF or BMP, max 4MB</span>
            {imagePreview ? <img src={imagePreview} alt="Member profile preview" className="mt-3 h-20 w-20 rounded-2xl object-cover"/> : null}
            <input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/bmp" disabled={imageLoading} className="mt-3 w-full text-xs text-gold" onChange={async event => {
              const input = event.currentTarget;
              const file = input.files?.[0]; setImagePreview(""); setError("");
              if (!file) return;
              setImageLoading(true);
              try { setImagePreview(await readImageFile(file, maxMemberImageSize)); }
              catch (err) { input.value = ""; setError(err instanceof Error ? err.message : "Could not read image."); }
              finally { setImageLoading(false); }
            }}/>
            {imageLoading ? <span className="mt-2 block text-xs">Reading image...</span> : null}
          </label>
          {error ? <p className="text-sm font-bold text-danger">{error}</p> : null}
          <AppButton disabled={imageLoading} className="w-full py-4 disabled:opacity-60" type="submit">
            Save Member
          </AppButton>
        </form>
      </Sheet>
    </section>
  );
}
