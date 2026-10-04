import type { Dispatch, FormEvent, SetStateAction } from "react";
import { AppButton } from "@/components/common/button";
import { createId } from "@/lib/utils";
import type { Tour } from "@/types/trip";

export function AddTourPage({
  setTours,
  onDone
}: {
  setTours: Dispatch<SetStateAction<Tour[]>>;
  onDone: () => void;
}) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const place = String(form.get("place") ?? "").trim();
    const date = String(form.get("date") ?? "");
    if (!name) return;

    setTours((current) => [
      {
        id: createId("tour"),
        name,
        place: place || name,
        createdAt: date ? new Date(date).toISOString() : new Date().toISOString(),
        status: "active",
        expenses: []
      },
      ...current
    ]);
    onDone();
  };

  return (
    <section className="px-7 pt-10">
      <p className="text-sm font-black text-gold">New Account</p>
      <h1 className="mt-1 text-4xl font-black">Add Tour</h1>
      <form onSubmit={handleSubmit} className="app-card mt-8 space-y-4 p-5">
        <input name="name" className="field" placeholder="Tour name" required />
        <input name="place" className="field" placeholder="Place, e.g. Sajek" />
        <input name="date" className="field" type="date" />
        <AppButton className="w-full py-4" type="submit">
          Create Tour Account
        </AppButton>
      </form>
    </section>
  );
}
