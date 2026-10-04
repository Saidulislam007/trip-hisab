import type { Category } from "@/types/trip";

export const maxMemberImageSize = 4 * 1024 * 1024;

export const categories: Category[] = [
  {
    key: "transport",
    icon: "Bus",
    name: "Transport",
    label: "Transport",
    examples: "Bus tickets, Khagrachari to Sajek Chander Gari reserve"
  },
  {
    key: "accommodation",
    icon: "Home",
    name: "Accommodation",
    label: "Accommodation",
    examples: "Eco-resort/cottage, booking advance, spot payment"
  },
  {
    key: "food",
    icon: "Utensils",
    name: "Food",
    label: "Food",
    examples: "Daily meals, BBQ, bamboo chicken, tea/snacks/water"
  },
  {
    key: "tickets",
    icon: "Ticket",
    name: "Tickets & Misc",
    label: "Tickets & Misc",
    examples: "Alutila/hanging bridge entry, army camp, driver/guide tips"
  }
];

export const suggestionsByCategory = {
  transport: ["Bus ticket", "Chander Gari reserve", "CNG fare", "Driver tip", "Fuel cost"],
  accommodation: ["Booking advance", "Spot payment", "Room rent", "Extra blanket", "Service charge"],
  food: ["Breakfast", "Lunch", "Dinner", "BBQ", "Tea/snacks/water"],
  tickets: ["Entry ticket", "Guide fee", "Army camp fee", "Bridge ticket", "Misc cost"]
};

