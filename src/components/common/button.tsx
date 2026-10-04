import type { ButtonHTMLAttributes } from "react";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "gold" | "dark" | "ghost" | "danger";
};

export function AppButton({ className = "", tone = "gold", ...props }: AppButtonProps) {
  const tones = {
    gold: "bg-gold text-ink shadow-glow",
    dark: "bg-ink text-milk",
    ghost: "bg-panelSoft text-goldSoft",
    danger: "bg-[#3a2331] text-danger"
  };

  return (
    <button
      className={`rounded-full px-5 py-3 text-sm font-black transition active:scale-95 ${tones[tone]} ${className}`}
      {...props}
    />
  );
}
