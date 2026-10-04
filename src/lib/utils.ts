import type { TeamMember } from "@/types/trip";

export const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const formatBDT = (value: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0
  }).format(value);

export const formatTourDate = (value: string) =>
  new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));

export const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export const getMemberPaid = (member: TeamMember) =>
  member.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

export const readImageFile = (file: File, maxSize: number) =>
  new Promise<string>((resolve, reject) => {
    if (!["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif", "image/bmp"].includes(file.type)) {
      reject(new Error("Please upload a PNG, JPEG, WebP, GIF, AVIF or BMP image."));
      return;
    }

    if (file.size > maxSize) {
      reject(new Error(`Image size must be ${Math.round(maxSize / (1024 * 1024))}MB or less.`));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Image upload failed."));
    reader.readAsDataURL(file);
  });
