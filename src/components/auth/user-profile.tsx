"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, LogOut } from "lucide-react";
import { AppButton } from "@/components/common/button";
import { authClient } from "@/lib/auth-client";
import { getInitials, readImageFile } from "@/lib/utils";
import { maxMemberImageSize } from "@/lib/data";

type User = { id: string; name: string; email: string; image?: string | null };
const inputClass = "mt-1 w-full min-w-0 rounded-xl bg-ink p-3 text-sm text-milk";

export function UserProfile({ user, onClose, onLogout }: { user: User; onClose: () => void; onLogout: () => void }) {
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(user.image ?? "");
  const [pending, setPending] = useState(false);
  const [readingImage, setReadingImage] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const { refetch } = authClient.useSession();

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4" onClick={() => { if (!pending && !readingImage) onClose(); }} onKeyDown={event => { if (event.key === "Escape" && !pending && !readingImage) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="profile-title" className="app-card max-h-[90svh] w-full max-w-[430px] overflow-y-auto p-5" onClick={event => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-3">
          <h2 id="profile-title" className="text-2xl font-black">My Profile</h2>
          <AppButton autoFocus tone="ghost" disabled={pending || readingImage} aria-label="Close profile" onClick={onClose} className="grid h-10 w-10 place-items-center p-0"><X size={18}/></AppButton>
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
        {notice && <p role="status" className="mt-4 text-sm text-gold">{notice}</p>}
        <form className="mt-5 space-y-4" onSubmit={async event => {
          event.preventDefault(); if (pending || readingImage) return;
          setPending(true); setError(""); setNotice("");
          try {
            const result = await authClient.updateUser({ name: name.trim(), image });
            if (result.error) throw new Error(result.error.message ?? "Profile update failed.");
            await refetch(); setNotice("Profile updated successfully.");
          } catch (cause) { setError(cause instanceof Error ? cause.message : "Profile update failed."); }
          finally { setPending(false); }
        }}>
          <fieldset disabled={pending || readingImage} className="min-w-0 space-y-4">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#9bc8c0] text-2xl font-black text-ink">{image ? <img src={image} alt="Profile preview" className="h-full w-full object-cover"/> : getInitials(name)}</div>
              <div className="min-w-0"><label className="text-sm font-bold">Profile image (max 4MB)<input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/bmp" className="mt-2 block w-full text-xs" onChange={async event => {
                const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
                setReadingImage(true); setError(""); setNotice("");
                try { setImage(await readImageFile(file, maxMemberImageSize)); }
                catch (cause) { setError(cause instanceof Error ? cause.message : "Cannot read image."); }
                finally { setReadingImage(false); }
              }}/></label>{image && <button type="button" className="mt-2 text-xs text-gold" onClick={() => setImage("")}>Remove image</button>}</div>
            </div>
            <label className="block text-sm font-bold">Name<input required maxLength={200} value={name} onChange={event => setName(event.target.value)} className={inputClass} autoComplete="name"/></label>
            <label className="block text-sm font-bold">Email<input readOnly value={user.email} className={`${inputClass} opacity-70`} autoComplete="email"/></label>
            <AppButton type="submit" className="w-full">{readingImage ? "Reading image…" : pending ? "Saving…" : "Save profile"}</AppButton>
          </fieldset>
        </form>
        <form className="mt-6 border-t border-milk/10 pt-5" onSubmit={async event => {
          event.preventDefault(); if (pending || readingImage) return;
          setError(""); setNotice("");
          if (newPassword !== confirmPassword) { setError("New passwords do not match."); return; }
          setPending(true);
          try {
            const result = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
            if (result.error) throw new Error(result.error.message ?? "Password change failed.");
            setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setShowPasswords(false);
            await refetch(); setNotice("Password changed. Other sessions have been signed out.");
          } catch (cause) { setError(cause instanceof Error ? cause.message : "Password change failed."); }
          finally { setPending(false); }
        }}>
          <h3 className="font-black">Change password</h3>
          <p className="mt-1 text-xs text-milk/60">Saved passwords cannot be displayed. Show reveals only what you type below.</p>
          <fieldset disabled={pending || readingImage} className="mt-3 min-w-0 space-y-3">
            <label className="block text-sm">Current password<input required maxLength={128} type={showPasswords ? "text" : "password"} autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} className={inputClass}/></label>
            <label className="block text-sm">New password<input required minLength={8} maxLength={128} type={showPasswords ? "text" : "password"} autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} className={inputClass}/></label>
            <label className="block text-sm">Confirm new password<input required minLength={8} maxLength={128} type={showPasswords ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className={inputClass}/></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showPasswords} onChange={event => setShowPasswords(event.target.checked)}/>Show passwords</label>
            <AppButton type="submit" className="w-full">{pending ? "Please wait…" : "Change password"}</AppButton>
          </fieldset>
        </form>
        <AppButton tone="danger" disabled={pending || readingImage} className="mt-5 w-full" onClick={() => { onClose(); onLogout(); }}><span className="flex items-center justify-center gap-2"><LogOut size={18}/>Logout</span></AppButton>
      </section>
    </div>, document.body
  );
}
