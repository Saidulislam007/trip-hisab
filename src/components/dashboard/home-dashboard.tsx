"use client";

import { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { AppButton } from "@/components/common/button";
import { categories } from "@/lib/data";
import { formatBDT, formatTourDate, getMemberPaid, getInitials } from "@/lib/utils";
import type { AppState, CategoryKey, Tour } from "@/types/trip";

const spent = (tour: Tour) => tour.expenses.reduce((sum, expense) => sum + expense.amount, 0);
const statusOf = (tour: Tour) => tour.status ?? "active";

export function HomeDashboard({ appState, onAdd, onCategory, onTeam }: {
  appState: AppState;
  onAdd: () => void;
  onCategory: (tourId: string, category: CategoryKey) => void;
  onTeam: (tourId: string) => void;
}) {
  const { tours, teamTours, setTours, setTeamTours } = appState;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const selected = tours.find(tour => tour.id === selectedId);
  const linkedMembers = (tour: Tour) => teamTours.filter(team => team.tourId === tour.id).flatMap(team => team.members);
  const paid = (tour: Tour) => linkedMembers(tour).reduce((sum, member) => sum + getMemberPaid(member), 0);
  const perPerson = (tour: Tour) => linkedMembers(tour).length ? formatBDT(spent(tour) / linkedMembers(tour).length) : "No members";
  const filtered = tours.filter(tour => `${tour.name} ${tour.place}`.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || (filter === "active" ? statusOf(tour) === "active" : statusOf(tour) !== "active")));
  const active = filtered.filter(tour => statusOf(tour) === "active");
  const archived = filtered.filter(tour => statusOf(tour) !== "active").sort((a,b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const years = [...new Set(archived.map(tour => new Date(tour.createdAt).getFullYear()))];
  const highest = tours.reduce<Tour | undefined>((best, tour) => !best || spent(tour) > spent(best) ? tour : best, undefined);
  const updateStatus = (status: "active" | "completed" | "settled") => setTours(current => current.map(tour => tour.id === selectedId ? { ...tour, status } : tour));
  const card = (tour: Tour, compact = false) => <button key={tour.id} type="button" onClick={() => { setSelectedId(tour.id); setConfirmDelete(false); }} className={`app-card w-full text-left ${compact ? "p-4" : "p-5"}`}>
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words text-xl font-black">{tour.name}</h3><p className="mt-1 text-sm text-goldSoft">{tour.place}</p></div><span className="shrink-0 rounded-full bg-ink px-3 py-1 text-xs capitalize text-gold">{statusOf(tour)}</span></div>
    <p className="mt-3 text-xs text-goldSoft">{formatTourDate(tour.createdAt)} · {new Date(tour.createdAt).getFullYear()}</p>
    <div className="mt-4 grid grid-cols-2 gap-3"><div><p className="text-xs text-gold">Total expense</p><p className="mt-1 text-xl font-bold">{formatBDT(spent(tour))}</p></div><div><p className="text-xs text-gold">{compact ? "Per person" : "Fund balance"}</p><p className="mt-1 text-xl font-bold">{compact ? perPerson(tour) : formatBDT(paid(tour) - spent(tour))}</p></div></div>
  </button>;

  if (selected) {
    const members = linkedMembers(selected);
    const payments = members.flatMap(member => member.payments.map(payment => ({ ...payment, memberName: member.name }))).sort((a,b) => Date.parse(b.date) - Date.parse(a.date));
    return <div className="space-y-5 px-6 pb-8 pt-8">
      <AppButton tone="ghost" onClick={() => setSelectedId(null)}><span className="flex items-center gap-2"><ArrowLeft size={16}/>My Tours</span></AppButton>
      <h1 className="break-words text-3xl font-black">{selected.name}</h1>
      <select aria-label="Switch tour" className="field" value={selected.id} onChange={event => { setSelectedId(event.target.value); setConfirmDelete(false); }}>{tours.map(tour => <option key={tour.id} value={tour.id}>{tour.name}</option>)}</select>
      <section className="app-card p-5"><h2 className="text-xl font-black">Summary</h2><p className="mt-2 text-sm text-goldSoft">{selected.place} · {formatTourDate(selected.createdAt)}</p><div className="mt-4 grid grid-cols-2 gap-4">{[["Expense",spent(selected)],["Team paid",paid(selected)],["Fund balance",paid(selected)-spent(selected)],["Funding shortfall",Math.max(0,spent(selected)-paid(selected))]].map(([label,value]) => <div key={label}><p className="text-xs text-gold">{label}</p><p className="mt-1 break-words text-lg font-bold">{formatBDT(Number(value))}</p></div>)}</div><p className="mt-3 text-xs text-goldSoft">Fund balance = member deposits − recorded expenses.</p></section>
      <section className="app-card p-5"><h2 className="text-xl font-black">Expense Categories</h2><div className="mt-3 space-y-2">{categories.map(category => <button key={category.key} onClick={() => onCategory(selected.id,category.key)} className="flex w-full items-center justify-between gap-3 rounded-xl bg-ink p-3 text-left text-sm"><span>{category.name}</span><span className="text-gold">{formatBDT(selected.expenses.filter(expense => expense.category === category.key).reduce((sum,expense) => sum+expense.amount,0))}</span></button>)}</div></section>
      <section className="app-card p-5">
        <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">Member Deposits</h2><span className="text-sm font-bold text-gold">{formatBDT(paid(selected))}</span></div>
        {members.map(member => <div key={member.id} className="mt-4 flex items-center gap-3 rounded-2xl bg-ink/50 p-3">
          {member.image ? <img src={member.image} alt={member.name} className="h-11 w-11 shrink-0 rounded-xl object-cover"/> : <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold text-sm font-black text-ink">{getInitials(member.name)}</span>}
          <div className="min-w-0 flex-1"><p className="break-words text-sm font-bold">{member.name}</p><p className="mt-1 text-xs text-goldSoft">{member.payments.length} payments</p></div>
          <div className="text-right"><p className="text-xs text-goldSoft">Total paid</p><p className="mt-1 text-sm font-bold text-gold">{formatBDT(getMemberPaid(member))}</p></div>
        </div>)}
        {!members.length && <p className="mt-3 text-sm text-goldSoft">Select your Team account below to show member deposits.</p>}
        {(selected.status ?? "active") === "active" && teamTours.some(team => !team.tourId) && <label className="mt-4 block text-xs font-bold text-goldSoft">Link an existing Team account
          <select className="field mt-2" value="" onChange={event => {
            const teamId = event.target.value;
            if (!teamId) return;
            setTeamTours(current => current.map(team => team.id === teamId && !team.tourId ? { ...team, tourId: selected.id, members: team.members.map(member => ({ ...member, tourId: selected.id, payments: member.payments.map(payment => ({ ...payment, tourId: selected.id })) })) } : team));
          }}>
            <option value="">Choose Team account</option>
            {teamTours.filter(team => !team.tourId).map(team => <option key={team.id} value={team.id}>{team.name} · {team.members.length} members</option>)}
          </select>
        </label>}
        <AppButton tone="ghost" className="mt-4" onClick={() => onTeam(selected.id)}>Manage Team</AppButton>
      </section>
      <section className="app-card p-5"><h2 className="text-xl font-black">Recent Expenses</h2>{selected.expenses.slice(0,5).map(expense => <div key={expense.id} className="mt-3 flex justify-between gap-3 text-sm"><div><p>{expense.title}</p><p className="text-xs text-goldSoft">{expense.payer} paid</p></div><span className="text-gold">{formatBDT(expense.amount)}</span></div>)}{!selected.expenses.length && <p className="mt-3 text-sm text-goldSoft">No expenses yet.</p>}</section>
      <section className="app-card p-5"><h2 className="text-xl font-black">Payment History</h2>{payments.slice(0,5).map(payment => <div key={payment.id} className="mt-3 flex justify-between gap-3 text-sm"><div><p>{payment.memberName} · {payment.note}</p><p className="text-xs text-goldSoft">{formatTourDate(payment.date)}</p></div><span className="text-gold">{formatBDT(payment.amount)}</span></div>)}{!payments.length && <p className="mt-3 text-sm text-goldSoft">No payments yet.</p>}</section>
      <section className="app-card p-5"><h2 className="text-xl font-black">Per Person</h2><p className="mt-3 text-2xl font-bold text-gold">{perPerson(selected)}</p><p className="mt-2 text-sm text-goldSoft">Equal expense share across {members.length} tour members. Individual settlement is not calculated.</p></section>
      <section className="app-card p-5"><h2 className="text-xl font-black">Tour Status</h2><p className="mt-2 capitalize text-gold">{statusOf(selected)}</p><p className="mt-2 text-sm text-goldSoft">Completed tours are archived. Reopen a tour to change expenses. Mark settled after all members have cleared their accounts.</p><div className="mt-4 flex flex-wrap gap-2">{statusOf(selected) === "active" ? <AppButton onClick={() => updateStatus("completed")}>Finish Tour</AppButton> : <AppButton tone="ghost" onClick={() => updateStatus("active")}>Reopen Tour</AppButton>}{statusOf(selected) === "completed" && <AppButton onClick={() => updateStatus("settled")}>Mark Settled</AppButton>}<AppButton tone="danger" onClick={() => setConfirmDelete(true)}>Delete Tour</AppButton></div></section>
      {confirmDelete && <div role="dialog" aria-modal="true" aria-labelledby="delete-title" className="fixed inset-0 z-50 grid place-items-center bg-ink/90 p-6"><div className="app-card w-full max-w-sm p-5"><h2 id="delete-title" className="text-xl font-black">Delete this tour?</h2><p className="mt-3 text-sm text-goldSoft">All expenses, linked teams, members and payments for this tour will be removed.</p><div className="mt-5 flex flex-wrap gap-3"><AppButton tone="ghost" onClick={() => setConfirmDelete(false)}>Cancel</AppButton><AppButton tone="danger" onClick={() => { setTours(current => current.filter(tour => tour.id !== selected.id)); setTeamTours(current => current.filter(team => team.tourId !== selected.id)); setSelectedId(null); setConfirmDelete(false); }}>Delete</AppButton></div></div></div>}
    </div>;
  }
  return <div className="space-y-6 px-6 pb-12 pt-8">
    <div><p className="text-sm font-bold text-gold">Your travel accounts</p><h1 className="mt-1 text-3xl font-black">My Tours</h1></div>
    <section className="app-card p-4"><div className="grid grid-cols-2 gap-3"><div><p className="text-xs text-gold">Total tours</p><p className="mt-1 text-2xl font-black">{tours.length}</p></div><div><p className="text-xs text-gold">All expenses</p><p className="mt-1 text-xl font-bold">{formatBDT(tours.reduce((sum,tour) => sum+spent(tour),0))}</p></div></div>{highest && <p className="mt-3 text-xs text-goldSoft">Highest expense: {highest.name} · {formatBDT(spent(highest))}</p>}</section>
    <div className="relative"><Search className="absolute left-4 top-4 text-gold" size={18}/><input id="tour-search" aria-label="Search tours" className="field pl-11" placeholder="Search tour or place" value={query} onChange={event => setQuery(event.target.value)}/></div>
    <div className="flex gap-2">{["all","active","completed"].map(item => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)} className={`flex-1 rounded-full px-3 py-3 text-xs font-bold capitalize ${filter === item ? "bg-gold text-ink" : "bg-panelSoft text-goldSoft"}`}>{item === "completed" ? "Archived" : item}</button>)}</div>
    {active.length > 0 && <section className="space-y-4"><h2 className="text-xl font-black">Active Tours</h2>{active.map(tour => card(tour))}</section>}
    {archived.length > 0 && <section className="space-y-4"><h2 className="text-xl font-black">Previous Tours</h2>{years.map(year => <div key={year} className="space-y-3"><h3 className="text-sm font-bold text-gold">{year}</h3>{archived.filter(tour => new Date(tour.createdAt).getFullYear() === year).map(tour => card(tour,true))}</div>)}</section>}
    {!filtered.length && <p className="app-card p-6 text-center text-sm text-goldSoft">{tours.length ? "No tours match your search." : "Create your first tour to start tracking expenses."}</p>}
  </div>;
}
