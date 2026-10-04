"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { UserProfile } from "@/components/auth/user-profile";
import { BottomNav } from "@/components/common/bottom-nav";
import { AppButton } from "@/components/common/button";
import { MobileFrame } from "@/components/common/mobile-frame";
import { TripLogo } from "@/components/common/logo";
import { AddTourPage } from "@/components/expenses/add-tour-page";
import { AccountDetailPage } from "@/components/expenses/account-detail-page";
import { CategoryExpensePage } from "@/components/expenses/category-expense-page";
import { HomeDashboard } from "@/components/dashboard/home-dashboard";
import { TeamAccountsPage } from "@/components/team/team-accounts-page";
import { TeamDetailPage } from "@/components/team/team-detail-page";
import { MemberDetailPage } from "@/components/team/member-detail-page";
import { PdfPage } from "@/components/dashboard/pdf-page";
import { getInitials } from "@/lib/utils";
import { categories } from "@/lib/data";
import type { AppState, CategoryKey, PageView } from "@/types/trip";

export function Dashboard({ appState, currentUser, onLogout }: { appState: AppState; currentUser: { id: string; name: string; email: string; image?: string | null }; onLogout: () => void }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [page, setPage] = useState<PageView>("home");
  const [selectedTourId, setSelectedTourId] = useState(appState.tours[0]?.id ?? "");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("transport");
  const [selectedTeamId, setSelectedTeamId] = useState(appState.teamTours[0]?.id ?? "");
  const [selectedMemberId, setSelectedMemberId] = useState(appState.teamTours[0]?.members[0]?.id ?? "");

  const selectedTour = useMemo(
    () => appState.tours.find((tour) => tour.id === selectedTourId) ?? appState.tours[0],
    [appState.tours, selectedTourId]
  );
  const selectedTeam = useMemo(
    () => appState.teamTours.find((team) => team.id === selectedTeamId) ?? appState.teamTours[0],
    [appState.teamTours, selectedTeamId]
  );
  const selectedMember = useMemo(
    () => selectedTeam?.members.find((member) => member.id === selectedMemberId) ?? selectedTeam?.members[0],
    [selectedTeam, selectedMemberId]
  );

  const openPage = (nextPage: PageView) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <MobileFrame>
      <section className="relative min-h-svh pb-28">
        {page === "home" ? (
          <header className="flex items-center justify-between px-7 pt-10">
            <TripLogo small />
            <div className="flex items-center gap-3">
              <AppButton tone="ghost" onClick={() => document.getElementById("tour-search")?.focus()} className="grid h-12 w-12 place-items-center p-0">
                <Search size={20} />
              </AppButton>
              <button
                type="button"
                title={`${currentUser.name} · Profile`}
                aria-label={`Open profile for ${currentUser.name}`}
                aria-haspopup="dialog"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen(true)}
                className="grid h-12 w-12 place-items-center rounded-full bg-[#9bc8c0] text-lg font-black text-ink"
              >
                {currentUser.image ? <img src={currentUser.image} alt={currentUser.name} className="h-full w-full rounded-full object-cover"/> : getInitials(currentUser.name)}
              </button>
            </div>
          </header>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
            transition={{ duration: 0.32 }}
          >
            {page === "home" ? <HomeDashboard appState={appState} onAdd={() => openPage("add")} onCategory={(tourId, category) => { setSelectedTourId(tourId); setSelectedCategory(category); openPage("categoryExpense"); }} onTeam={(tourId) => { const team = appState.teamTours.find(item => item.tourId === tourId); if (team) { setSelectedTeamId(team.id); openPage("teamDetail"); } else openPage("team"); }} /> : null}
            {page === "accounts" ? (
              <AccountDetailPage
                tours={appState.tours}
                onOpenTour={(tourId) => {
                  setSelectedTourId(tourId);
                  setPage("accountDetail");
                }}
              />
            ) : null}
            {page === "accountDetail" && selectedTour ? (
              <AccountDetailPage
                tours={[selectedTour]}
                title="Category Details"
                showBack
                onBack={() => openPage("accounts")}
                onOpenCategory={(categoryKey) => {
                  setSelectedCategory(categoryKey);
                  setPage("categoryExpense");
                }}
              />
            ) : null}
            {page === "categoryExpense" && selectedTour ? (
              <CategoryExpensePage
                category={categories.find((item) => item.key === selectedCategory) ?? categories[0]}
                tour={selectedTour}
                setTours={appState.setTours}
                payerNames={[...new Set([currentUser.name, ...appState.teamTours.filter(team => team.tourId === selectedTour.id).flatMap(team => team.members.map(member => member.name)), ...selectedTour.expenses.map(expense => expense.payer)].map(name => name.trim()).filter(Boolean))]}
                onBack={() => openPage("accountDetail")}
              />
            ) : null}
            {page === "add" ? <AddTourPage setTours={appState.setTours} onDone={() => openPage("home")} /> : null}
            {page === "team" ? (
              <TeamAccountsPage
                teams={appState.teamTours}
                tours={appState.tours}
                setTeams={appState.setTeamTours}
                onOpenTeam={(teamId) => {
                  setSelectedTeamId(teamId);
                  const firstMember = appState.teamTours.find((team) => team.id === teamId)?.members[0];
                  setSelectedMemberId(firstMember?.id ?? "");
                  setPage("teamDetail");
                }}
              />
            ) : null}
            {page === "teamDetail" && selectedTeam ? (
              <TeamDetailPage
                team={selectedTeam}
                readOnly={appState.tours.some(tour => tour.id === selectedTeam.tourId && (tour.status ?? "active") !== "active")}
                setTeams={appState.setTeamTours}
                onBack={() => openPage("team")}
                onOpenMember={(memberId) => {
                  setSelectedMemberId(memberId);
                  setPage("memberDetail");
                }}
              />
            ) : null}
            {page === "memberDetail" && selectedTeam && selectedMember ? (
              <MemberDetailPage
                team={selectedTeam}
                member={selectedMember}
                readOnly={appState.tours.some(tour => tour.id === selectedTeam.tourId && (tour.status ?? "active") !== "active")}
                setTeams={appState.setTeamTours}
                onBack={() => openPage("teamDetail")}
              />
            ) : null}
            {page === "pdf" ? <PdfPage /> : null}
          </motion.div>
        </AnimatePresence>

        <BottomNav activePage={page} onChange={openPage} />
        {profileOpen && <UserProfile user={currentUser} onClose={() => setProfileOpen(false)} onLogout={onLogout}/>}
      </section>
    </MobileFrame>
  );
}
