import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Games are configuration (not demo data). Fake numeric stats have been removed.
// Real stats are computed from live posts on the backend / frontend.
export const GAMES_META = {
  "mobile-legends": {
    slug: "mobile-legends",
    name: "Mobile Legends",
    short: "ML",
    accent: "#0088FF",
    accent2: "#00F0FF",
    hero: "https://images.unsplash.com/photo-1718632714530-4bb8a792bd51",
    tagline: "Домгууд Мөнх Гэрэлт Ертөнцөд Мөргөлддөг.",
    intro:
      "Дайчнаас Мифийн Алдар хүртэл. Домгийн скин, мифийн зэрэглэл, аваргын түвшний баатруудтай сонгомол бүртгэл.",
    className: "accent-ml",
  },
  "pubg-mobile": {
    slug: "pubg-mobile",
    name: "PUBG Mobile",
    short: "PUBGM",
    accent: "#FF7A18",
    accent2: "#FFD166",
    hero: "https://images.unsplash.com/photo-1579912436616-f74ceee1ae07",
    tagline: "Буулт. Олз. Ноёрхол.",
    intro:
      "Conqueror түвшний бүртгэл, мифийн UC багц, домгийн скинүүд. Бүртгэл бүр тулаанд туршигдсан, баталгаажсан.",
    className: "accent-pubg",
  },
  "standoff-2": {
    slug: "standoff-2",
    name: "Standoff 2",
    short: "SO2",
    accent: "#4CC2FF",
    accent2: "#A78BFA",
    hero: "https://images.pexels.com/photos/19964747/pexels-photo-19964747.jpeg",
    tagline: "Тактиктай. Нарийн. Хатуу.",
    intro:
      "Immortal зэрэглэл, алтан хутганууд, дээд зэрэглэлийн тоноглол. Мэргэшсэн операторуудад зориулав.",
    className: "accent-standoff",
  },
};

export const GROUPS = ["300K-900K", "901K-1.5M", "1.6M-15M"];
