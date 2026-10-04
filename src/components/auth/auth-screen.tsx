"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { readImageFile } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { AppButton } from "@/components/common/button";
import { MobileFrame } from "@/components/common/mobile-frame";
import { TripLogo } from "@/components/common/logo";

export function AuthScreen({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [image, setImage] = useState("");

  return (
    <MobileFrame>
      <section className="grid min-h-svh place-items-center px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.2, 0.9, 0.2, 1] }}
          className="w-full"
        >
          <div className="mb-9 text-center">
            <motion.div
              initial={{ y: 80, scale: 1.25 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.2, 0.9, 0.2, 1] }}
            >
              <TripLogo />
            </motion.div>
            <p className="mt-4 text-sm font-bold text-goldSoft/80">Tour expense and team payment tracker</p>
          </div>

          <div className="app-card p-5">
            <div className="mb-5 grid grid-cols-2 rounded-full bg-ink p-1">
              {(["login", "register"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled={pending}
                  onClick={() => { setMode(item); setError(""); setNotice(""); }}
                  className={`rounded-full py-2 text-sm font-black capitalize transition ${
                    mode === item ? "bg-gold text-ink" : "text-milk/60"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <form
              className="space-y-3"
              onSubmit={async (event) => {
                event.preventDefault();
                if (pending) return;
                const formElement = event.currentTarget;
                const form = new FormData(formElement);
                const email = String(form.get("email") || "").trim();
                const password = String(form.get("password") || "");
                setPending(true); setError(""); setNotice("");
                try {
                  const result = mode === "register"
                    ? await authClient.signUp.email({ name: String(form.get("name") || "").trim(), email, password, ...(image ? { image } : {}) })
                    : await authClient.signIn.email({ email, password });
                  if (result.error) { setError(result.error.message || "Authentication failed."); return; }
                  if (mode === "register") {
                    formElement.reset(); setImage(""); setMode("login");
                    setNotice("Registration completed. Please log in to continue.");
                  } else onSuccess();
                } catch { setError("Unable to connect to the authentication server. Please try again."); }
                finally { setPending(false); }
              }}
            >
              {mode === "register" ? <input name="name" className="field" placeholder="Full name" autoComplete="name" maxLength={200} required /> : null}
              {mode === "register" ? <label className="block rounded-2xl border border-dashed border-gold/30 bg-ink/40 p-4 text-sm font-bold text-goldSoft">
                Profile image (optional)
                <span className="mt-1 block text-xs text-gold">PNG, JPEG, WebP, GIF, AVIF or BMP · max 4MB</span>
                {image ? <img src={image} alt="Profile preview" className="mt-3 h-16 w-16 rounded-2xl object-cover"/> : null}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/bmp" disabled={pending} className="mt-3 block w-full min-w-0 text-xs" onChange={async event => {
                  const input = event.currentTarget;
                  const file = input.files?.[0]; setError(""); setImage("");
                  if (!file) return;
                  setPending(true);
                  try { setImage(await readImageFile(file, 4 * 1024 * 1024)); }
                  catch (err) { input.value = ""; setError(err instanceof Error ? err.message : "Image could not be read."); }
                  finally { setPending(false); }
                }}/>
              </label> : null}
              {notice ? <p role="status" className="text-sm text-[#72d9b4]">{notice}</p> : null}
              <input name="email" type="email" className="field" placeholder="Email address" autoComplete="email" required />
              <input name="password" className="field" type="password" placeholder="Password (at least 8 characters)" minLength={8} maxLength={128} autoComplete={mode === "register" ? "new-password" : "current-password"} required />
              {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
              <AppButton disabled={pending} className="w-full py-4 disabled:opacity-60" type="submit">
                {pending ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
              </AppButton>
            </form>
          </div>
        </motion.div>
      </section>
    </MobileFrame>
  );
}
