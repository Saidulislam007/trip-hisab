"use client";

import { ArrowLeft, Plus } from "lucide-react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { AppButton } from "@/components/common/button";
import { Sheet } from "@/components/common/sheet";
import { createId, formatBDT, formatTourDate, getInitials, getMemberPaid } from "@/lib/utils";
import type { Payment, TeamMember, TeamTour } from "@/types/trip";

export function MemberDetailPage({
  team,
  readOnly = false,
  member,
  setTeams,
  onBack
}: {
  team: TeamTour;
  readOnly?: boolean;
  member: TeamMember;
  setTeams: Dispatch<SetStateAction<TeamTour[]>>;
  onBack: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  const savePayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (readOnly) return;
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("amount") ?? 0);
    const note = String(form.get("note") ?? "").trim() || "Member payment";
    if (!Number.isFinite(amount) || amount <= 0) return;

    setTeams((current) =>
      current.map((currentTeam) =>
        currentTeam.id === team.id
          ? {
              ...currentTeam,
              members: currentTeam.members.map((currentMember) => {
                if (currentMember.id !== member.id) return currentMember;
                const nextPayment = {
                  tourId: team.tourId,
                  id: editingPayment?.id ?? createId("payment"),
                  amount,
                  note,
                  date: editingPayment?.date ?? new Date().toISOString()
                };
                return {
                  ...currentMember,
                  payments: editingPayment
                    ? currentMember.payments.map((payment) => (payment.id === editingPayment.id ? nextPayment : payment))
                    : [nextPayment, ...currentMember.payments]
                };
              })
            }
          : currentTeam
      )
    );
    setEditingPayment(null);
    setOpen(false);
  };

  const deletePayment = (paymentId: string) => {
    if (readOnly) return;
    setTeams((current) =>
      current.map((currentTeam) =>
        currentTeam.id === team.id
          ? {
              ...currentTeam,
              members: currentTeam.members.map((currentMember) =>
                currentMember.id === member.id
                  ? { ...currentMember, payments: currentMember.payments.filter((payment) => payment.id !== paymentId) }
                  : currentMember
              )
            }
          : currentTeam
      )
    );
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
        <div className="flex items-center gap-5">
          {member.image ? (
            <img src={member.image} alt={member.name} className="h-24 w-24 rounded-3xl object-cover ring-1 ring-gold/30" />
          ) : (
            <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gold text-3xl font-black text-ink">
              {getInitials(member.name)}
            </div>
          )}
          <div>
            <p className="text-sm font-black text-gold">Member Profile</p>
            <h1 className="text-4xl font-black">{member.name}</h1>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-3xl bg-ink p-4">
            <p className="text-sm font-black text-gold">Total Paid</p>
            <p className="mt-2 text-2xl font-black">{formatBDT(getMemberPaid(member))}</p>
          </div>
          <div className="rounded-3xl bg-ink p-4">
            <p className="text-sm font-black text-gold">Payments</p>
            <p className="mt-2 text-4xl font-black">{member.payments.length}</p>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-2xl font-black">Payment History</h2>
      <div className="mt-5 space-y-4">
        {member.payments.length ? (
          member.payments.map((payment, index) => (
            <article key={payment.id} className="app-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-gold">Payment {member.payments.length - index}</p>
                  <p className="mt-1 text-3xl font-light">{formatBDT(payment.amount)}</p>
                  <p className="mt-1 text-sm font-bold text-goldSoft">{payment.note}</p>
                </div>
                <div className="grid justify-items-end gap-2">
                  <p className="text-right text-xs font-black text-gold">{formatTourDate(payment.date)}</p>
                  <div className={`flex gap-2 ${readOnly ? "hidden" : ""}`}>
                    <AppButton
                      tone="ghost"
                      className="px-3 py-1 text-xs"
                      onClick={() => {
                        setEditingPayment(payment);
                        setOpen(true);
                      }}
                    >
                      Edit
                    </AppButton>
                    <AppButton tone="danger" className="px-3 py-1 text-xs" onClick={() => deletePayment(payment.id)}>
                      Delete
                    </AppButton>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-gold/30 bg-panel p-5 text-center text-sm font-bold text-gold">
            No payments added yet.
          </div>
        )}
      </div>

      {typeof document !== "undefined" && !open && !readOnly ? createPortal(
        <button
          type="button"
          aria-label="Add payment"
          onClick={() => {
            setEditingPayment(null);
            setOpen(true);
          }}
          className="fixed bottom-28 right-[max(28px,calc((100vw-480px)/2+28px))] z-40 grid h-16 w-16 place-items-center rounded-full bg-gold text-ink shadow-glow"
        >
          <Plus size={30} strokeWidth={3} />
        </button>
      , document.body) : null}

      {readOnly ? <p className="mt-5 text-sm text-gold">Archived tour: reopen it to change member payments.</p> : null}
      <Sheet open={open && !readOnly} title={editingPayment ? "Edit Payment" : "Add Payment"} label={member.name} onClose={() => setOpen(false)}>
        <form onSubmit={savePayment} className="space-y-3">
          <input name="amount" type="number" min={1} className="field" placeholder="Payment amount" defaultValue={editingPayment?.amount} required />
          <input name="note" className="field" placeholder="Reason, e.g. bus ticket" defaultValue={editingPayment?.note} />
          <AppButton className="w-full py-4" type="submit">
            Save Payment
          </AppButton>
        </form>
      </Sheet>
    </section>
  );
}
