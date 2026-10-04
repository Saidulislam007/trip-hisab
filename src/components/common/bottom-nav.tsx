import { Clock3, Grid3X3, Plus, Square, WalletCards } from "lucide-react";
import type { ReactNode } from "react";
import type { PageView } from "@/types/trip";

type NavItem = {
  page: PageView;
  label: string;
  icon: ReactNode;
};

const navItems: NavItem[] = [
  { page: "home", label: "Home", icon: <Grid3X3 size={19} /> },
  { page: "accounts", label: "Accounts", icon: <Square size={19} /> },
  { page: "add", label: "Add", icon: <Plus size={21} /> },
  { page: "team", label: "Team", icon: <WalletCards size={23} /> },
  { page: "pdf", label: "PDF", icon: <Clock3 size={19} /> }
];

export function BottomNav({
  activePage,
  onChange
}: {
  activePage: PageView;
  onChange: (page: PageView) => void;
}) {
  return (
    <nav className="bottom-nav fixed bottom-0 left-1/2 z-40 grid min-h-[68px] w-full max-w-[480px] -translate-x-1/2 grid-cols-5 rounded-none px-2 pb-[env(safe-area-inset-bottom)] text-xs font-bold">
      {navItems.map((item) => {
        const active =
          activePage === item.page ||
          (item.page === "accounts" && ["accountDetail", "categoryExpense"].includes(activePage)) ||
          (item.page === "team" && ["teamDetail", "memberDetail"].includes(activePage));

        return (
          <button
            key={item.page}
            type="button"
            onClick={() => onChange(item.page)}
            className={`flex flex-col items-center justify-center gap-1 py-3 transition ${active ? "text-gold" : "text-milk/60"}`}
          >
            <span className={active ? "drop-shadow-[0_0_18px_rgba(216,164,93,0.9)]" : ""}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
