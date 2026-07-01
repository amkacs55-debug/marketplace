import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const GAMES_META = {
  "mobile-legends": {
    slug: "mobile-legends",
    name: "Mobile Legends",
    short: "ML",
    accent: "#0088FF",
    accent2: "#00F0FF",
    hero: "https://images.unsplash.com/photo-1718632714530-4bb8a792bd51",
    bg: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000",
    tagline: "Legends Collide in the Land of Dawn",
    intro: "Ascend from Warrior to Mythic Glory. Curated accounts with legendary skins, mythic ranks and championship-tier heroes.",
    className: "accent-ml",
  },
  "pubg-mobile": {
    slug: "pubg-mobile",
    name: "PUBG Mobile",
    short: "PUBGM",
    accent: "#FF7A18",
    accent2: "#FFD166",
    hero: "https://images.unsplash.com/photo-1579912436616-f74ceee1ae07",
    bg: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2000",
    tagline: "Drop. Loot. Dominate.",
    intro: "Conqueror-tier accounts, mythic UC bundles, iconic skins. Every account battle-tested and verified.",
    className: "accent-pubg",
  },
  "standoff-2": {
    slug: "standoff-2",
    name: "Standoff 2",
    short: "SO2",
    accent: "#4CC2FF",
    accent2: "#A78BFA",
    hero: "https://images.pexels.com/photos/19964747/pexels-photo-19964747.jpeg",
    bg: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=2000",
    tagline: "Tactical. Precise. Ruthless.",
    intro: "Immortal ranks, gold knives, prestige loadouts. Precision-tier accounts for competitive operators.",
    className: "accent-standoff",
  },
};

export const formatPrice = (p) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p || 0);

export const formatCompact = (n) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n || 0);

export const GROUPS = ["300K-900K", "901K-1.5M", "1.6M-15M"];
