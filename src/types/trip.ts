import type { Dispatch, SetStateAction } from "react";

export type CategoryKey = "transport" | "accommodation" | "food" | "tickets";

export type Category = {
  key: CategoryKey;
  icon: string;
  name: string;
  label: string;
  examples: string;
};

export type Expense = {
  id: string;
  tourId?: string;
  title: string;
  amount: number;
  payer: string;
  category: CategoryKey;
};

export type Tour = {
  id: string;
  name: string;
  place: string;
  createdAt: string;
  status?: "active" | "completed" | "settled";
  expenses: Expense[];
};

export type Payment = {
  id: string;
  tourId?: string;
  amount: number;
  note: string;
  date: string;
};

export type TeamMember = {
  id: string;
  tourId?: string;
  name: string;
  image: string;
  payments: Payment[];
};

export type TeamTour = {
  id: string;
  tourId?: string;
  name: string;
  createdAt: string;
  members: TeamMember[];
};

export type AppState = {
  tours: Tour[];
  setTours: Dispatch<SetStateAction<Tour[]>>;
  teamTours: TeamTour[];
  setTeamTours: Dispatch<SetStateAction<TeamTour[]>>;
};

export type PageView =
  | "home"
  | "accounts"
  | "accountDetail"
  | "categoryExpense"
  | "add"
  | "team"
  | "teamDetail"
  | "memberDetail"
  | "pdf";
