export function TripLogo({ small = false }: { small?: boolean }) {
  return (
    <div
      className={[
        "inline-block font-black uppercase leading-[0.86] tracking-[-0.08em] text-gold",
        small ? "text-[2rem]" : "text-[4.5rem]"
      ].join(" ")}
      aria-label="Trip Hisab"
    >
      <span className="block">Trip</span>
      <span className="block">Hisab</span>
    </div>
  );
}
