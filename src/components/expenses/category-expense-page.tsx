"use client";

import { ArrowLeft, Bus, Home, Plus, Ticket, Utensils } from "lucide-react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { AppButton } from "@/components/common/button";
import { Sheet } from "@/components/common/sheet";
import { suggestionsByCategory } from "@/lib/data";
import { createId, formatBDT } from "@/lib/utils";
import type { Category, Expense, Tour } from "@/types/trip";

const iconMap = { Bus, Home, Utensils, Ticket };

export function CategoryExpensePage({
  category,
  payerNames = [],
  tour,
  setTours,
  onBack
}: {
  category: Category;
  payerNames?: string[];
  tour: Tour;
  setTours: Dispatch<SetStateAction<Tour[]>>;
  onBack: () => void;
}) {
  const members = [...new Set(payerNames.map(name => name.trim()).filter(Boolean))];
  const [otherPayer, setOtherPayer] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const Icon = iconMap[category.icon as keyof typeof iconMap];
  const categoryExpenses = tour.expenses.filter((expense) => expense.category === category.key);

  const saveExpense = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (tour.status && tour.status !== "active") return;
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const amount = Number(form.get("amount") ?? 0);
    const payer = String(form.get(otherPayer ? "otherPayer" : "payer") ?? "").trim();
    if (!title || !Number.isFinite(amount) || amount <= 0 || !payer.trim()) return;

    setTours((current) =>
      current.map((item) => {
        if (item.id !== tour.id) return item;
        const nextExpense = { tourId: tour.id, id: editingExpense?.id ?? createId("expense"), title, amount, payer, category: category.key };
        return {
          ...item,
          expenses: editingExpense
            ? item.expenses.map((expense) => (expense.id === editingExpense.id ? nextExpense : expense))
            : [nextExpense, ...item.expenses]
        };
      })
    );
    setEditingExpense(null);
    setOpen(false);
  };

  const deleteExpense = (expenseId: string) => {
    if (tour.status && tour.status !== "active") return;
    setTours((current) =>
      current.map((item) =>
        item.id === tour.id ? { ...item, expenses: item.expenses.filter((expense) => expense.id !== expenseId) } : item
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
        <p className="font-black">{tour.place}</p>
      </div>
      <p className="text-sm font-black text-gold">Expense Categories</p>
      <h1 className="mt-1 text-4xl font-black">Category Details</h1>

      <div className="app-card mt-8 p-5">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ink text-gold">
            <Icon size={26} />
          </div>
          <div>
            <h2 className="text-2xl font-black">{category.name}</h2>
            <p className="text-sm font-bold text-gold">{category.label}</p>
            <p className="mt-3 text-sm leading-6 text-goldSoft/80">{category.examples}</p>
          </div>
        </div>
      </div>

      {tour.status && tour.status !== "active" ? <p className="mt-5 text-sm text-gold">Archived tour: expenses are read-only.</p> : null}
      <div className="mt-7 space-y-4">
        {categoryExpenses.length ? (
          categoryExpenses.map((expense) => (
            <article key={expense.id} className="app-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black">{expense.title}</h3>
                  <p className="mt-1 text-sm font-bold text-gold">{expense.payer} paid</p>
                  <p className="mt-2 text-2xl font-light">{formatBDT(expense.amount)}</p>
                </div>
                <div className={`grid gap-2 ${tour.status && tour.status !== "active" ? "hidden" : ""}`}>
                  <AppButton
                    type="button"
                    tone="ghost"
                    className="px-4 py-2"
                    onClick={() => {
                      setOtherPayer(false);
                      setEditingExpense(expense);
                      setOpen(true);
                    }}
                  >
                    Edit
                  </AppButton>
                  <AppButton type="button" tone="danger" className="px-4 py-2" onClick={() => deleteExpense(expense.id)}>
                    Delete
                  </AppButton>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-gold/30 bg-panel p-5 text-center text-sm font-bold text-gold">
            No expenses added in this category yet.
          </div>
        )}
      </div>

      {typeof document !== "undefined" && (tour.status ?? "active") === "active" ? createPortal(<button
        type="button"
          aria-label="Add expense"
        onClick={() => {
          setOtherPayer(!members.length);
          setEditingExpense(null);
          setOpen(true);
        }}
        className="fixed bottom-28 right-[max(28px,calc((100vw-480px)/2+28px))] z-40 grid h-16 w-16 place-items-center rounded-full bg-gold text-ink shadow-glow"
      >
        <Plus size={30} strokeWidth={3} />
      </button>, document.body) : null}

      <Sheet open={open} title={editingExpense ? "Edit Expense" : "Add New Expense"} label={category.name} onClose={() => setOpen(false)}>
        <form onSubmit={saveExpense} className="space-y-3">
          {!members.length && !editingExpense ? <p className="text-sm text-gold">Enter the payer name below. Link a Team to this tour to select its members.</p> : null}
          <input name="title" className="field" placeholder="Expense reason" defaultValue={editingExpense?.title} required />
          <div className="flex flex-wrap gap-2">
            {suggestionsByCategory[category.key].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={(event) => {
                  const input = event.currentTarget.closest("form")?.elements.namedItem("title") as HTMLInputElement | null;
                  if (input) input.value = suggestion;
                }}
                className="rounded-full bg-panelSoft px-3 py-2 text-xs font-black text-goldSoft"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="amount" type="number" min={1} className="field" placeholder="Amount" defaultValue={editingExpense?.amount} required />
            <select aria-label="Select payer" name="payer" className="field" defaultValue={editingExpense?.payer ?? members[0] ?? "__other_payer__"} required onChange={event => setOtherPayer(event.target.selectedOptions[0]?.dataset.other === "true")}>
              <option value="" disabled>Select payer</option>
              {editingExpense?.payer && !members.includes(editingExpense.payer) ? <option value={editingExpense.payer}>{editingExpense.payer}</option> : null}
              {members.map((member) => (
                <option key={member} value={member}>
                  {member}
                </option>
              ))}
              <option value="__other_payer__" data-other="true">Other payer (enter name)</option>
            </select>
          </div>
          {otherPayer && <input aria-label="Payer name" name="otherPayer" className="field" placeholder="Payer name" maxLength={200} required autoFocus/>}
          <AppButton className="w-full py-4" type="submit">
            Save Expense
          </AppButton>
        </form>
      </Sheet>
    </section>
  );
}
