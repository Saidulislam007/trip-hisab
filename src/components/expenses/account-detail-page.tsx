import { ArrowLeft, Bus, Home, Ticket, Utensils, ChevronRight } from "lucide-react";
import { AppButton } from "@/components/common/button";
import { categories } from "@/lib/data";
import { formatBDT, formatTourDate } from "@/lib/utils";
import type { CategoryKey, Tour } from "@/types/trip";

const iconMap = {
  Bus,
  Home,
  Utensils,
  Ticket
};

export function AccountDetailPage({
  tours,
  title = "Expense Categories",
  showBack = false,
  onBack,
  onOpenTour,
  onOpenCategory
}: {
  tours: Tour[];
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onOpenTour?: (tourId: string) => void;
  onOpenCategory?: (categoryKey: CategoryKey) => void;
}) {
  if (!onOpenCategory) {
    return (
      <section className="px-7 pt-10">
        <p className="text-sm font-black text-gold">Expense Accounts</p>
        <h1 className="mt-1 text-4xl font-black">Tour Accounts</h1>
        <div className="mt-8 space-y-5">
          {tours.map((tour) => {
            const total = tour.expenses.reduce((sum, expense) => sum + expense.amount, 0);
            return (
              <button key={tour.id} type="button" onClick={() => onOpenTour?.(tour.id)} className="app-card w-full p-5 text-left">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-black text-gold">Tour Name</p>
                    <h2 className="mt-1 text-3xl font-black">{tour.name}</h2>
                    <p className="mt-1 text-sm font-bold text-goldSoft">{tour.place}</p>
                  </div>
                  <ChevronRight className="rounded-full bg-ink p-2 text-milk" size={42} />
                </div>
                <div className="mt-7 flex items-end justify-between">
                  <div>
                    <p className="text-sm font-black text-gold">Total Khoroch</p>
                    <p className="text-4xl font-light">{formatBDT(total)}</p>
                  </div>
                  <p className="text-right text-sm font-black text-milk">{formatTourDate(tour.createdAt)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  const tour = tours[0];
  const totals = Object.fromEntries(categories.map((item) => [item.key, 0])) as Record<CategoryKey, number>;
  tour.expenses.forEach((expense) => {
    totals[expense.category] += expense.amount;
  });

  return (
    <section className="px-7 pt-10">
      {showBack ? (
        <div className="mb-8 flex items-center justify-between">
          <AppButton tone="ghost" onClick={onBack}>
            <span className="inline-flex items-center gap-2">
              <ArrowLeft size={18} /> Back
            </span>
          </AppButton>
          <p className="font-black">{tour.place}</p>
        </div>
      ) : null}
      <p className="text-sm font-black text-gold">Expense Categories</p>
      <h1 className="mt-1 text-4xl font-black">{title}</h1>
      <div className="mt-8 space-y-5">
        {categories.map((category) => {
          const Icon = iconMap[category.icon as keyof typeof iconMap];
          return (
            <button
              key={category.key}
              type="button"
              onClick={() => onOpenCategory(category.key)}
              className="app-card w-full p-5 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink text-gold">
                  <Icon size={26} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-2xl font-black">{category.name}</h2>
                      <p className="text-sm font-bold text-gold">{category.label}</p>
                    </div>
                    <span className="rounded-full bg-panelSoft px-3 py-1 text-sm font-black text-goldSoft">
                      {formatBDT(totals[category.key])}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-goldSoft/80">{category.examples}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
