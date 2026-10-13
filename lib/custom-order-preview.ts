// Client-safe helpers for the live customization preview — no `db` import.

export const PLACEMENTS = [
  { value: "left-chest", label: "Left Chest" },
  { value: "center-front", label: "Center Front" },
  { value: "center-back", label: "Center Back" },
] as const;

export type PlacementValue = (typeof PLACEMENTS)[number]["value"];

// No real font files are uploaded yet, so this maps common naming keywords
// in a Font Option's name to a close web-safe approximation. Swap for real
// @font-face families once fonts are actually uploaded to the catalog.
export function fontFamilyFor(name?: string | null): string {
  if (!name) return "inherit";
  const lower = name.toLowerCase();
  if (lower.includes("script") || lower.includes("cursive")) {
    return "'Brush Script MT', 'Segoe Script', cursive";
  }
  if (lower.includes("serif") && !lower.includes("sans")) {
    return "Georgia, 'Times New Roman', serif";
  }
  if (lower.includes("block") || lower.includes("bold") || lower.includes("condensed")) {
    return "'Arial Black', 'Arial Narrow', sans-serif";
  }
  if (lower.includes("mono") || lower.includes("typewriter")) {
    return "'Courier New', monospace";
  }
  return "system-ui, -apple-system, sans-serif";
}

type PreviewPoint = { top: number; left: number };

// One placement point per photo, hand-calibrated against the actual cropped
// image (the same w=800&h=1000&fit=crop used in prisma/seed.ts) rather than
// a single set of zones reused across every product photo. Our stock photos
// have wildly different framing — a hanging flat-front shirt, a person worn
// portrait, a cluttered market-stall jacket shot, a bag flat lay with straps
// crossing the front — so one generic "central zone" always ends up on a
// hanger, a face, or a prop for *some* of them. Keyed by the Unsplash photo
// id (stable across query-string changes); falls back to DEFAULT_PROFILE for
// any photo not explicitly calibrated.
const DEFAULT_PROFILE: Record<PlacementValue, PreviewPoint> = {
  "left-chest": { top: 38, left: 35 },
  "center-front": { top: 50, left: 50 },
  "center-back": { top: 68, left: 50 },
};

const PHOTO_PROFILES: Record<string, Record<PlacementValue, PreviewPoint>> = {
  // Hoodie — front-facing worn portrait; drawstrings run down the center,
  // so both chest points sit either side of them and the "center" point
  // lands on the kangaroo pocket instead of the drawstring knots.
  "1564557287817-3785e38ec1f5": {
    "left-chest": { top: 45, left: 28 },
    "center-front": { top: 72, left: 50 },
    "center-back": { top: 45, left: 72 },
  },
  // Denim jacket — busy market-stall background; points land on the lapel
  // and chest, away from the hanging price tag and the printed lower panel.
  "1602082805057-3c32f79817a1": {
    "left-chest": { top: 38, left: 42 },
    "center-front": { top: 50, left: 46 },
    "center-back": { top: 68, left: 55 },
  },
  // Two jackets on hooks with a cap draped over one — calibrated to the
  // clearer (right-hand, olive) jacket rather than the frame center.
  "1533230464445-e01ef07c65c5": {
    "left-chest": { top: 40, left: 65 },
    "center-front": { top: 52, left: 70 },
    "center-back": { top: 68, left: 68 },
  },
  // Trucker cap — points target the front panel, left of the side seam.
  "1588850561407-ed78c282e89b": {
    "left-chest": { top: 35, left: 38 },
    "center-front": { top: 42, left: 48 },
    "center-back": { top: 50, left: 58 },
  },
  // Tote flat lay — the straps cross the front and meet near the top, and
  // the bag already has a printed graphic lower down, so all three points
  // stay in the narrow clear canvas between the straps and above the print.
  "1780480999319-ba6a502ed72c": {
    "left-chest": { top: 32, left: 40 },
    "center-front": { top: 40, left: 50 },
    "center-back": { top: 48, left: 60 },
  },
  // Duffel bag — fills almost the whole frame; points spread across its
  // visible face rather than sitting in the exact center every time.
  "1758542988969-39a10168b2ce": {
    "left-chest": { top: 42, left: 30 },
    "center-front": { top: 48, left: 50 },
    "center-back": { top: 55, left: 68 },
  },
  // Knit beanie — worn in profile with the face taking up most of the
  // frame; points are squeezed onto the small visible ribbed cuff area.
  "1521071381475-44a6edc53727": {
    "left-chest": { top: 46, left: 33 },
    "center-front": { top: 40, left: 38 },
    "center-back": { top: 52, left: 34 },
  },
};

function photoIdFor(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  const match = imageUrl.match(/photo-(\d+-[0-9a-f]+)/);
  return match ? match[1] : null;
}

export function placementPoint(
  placement: PlacementValue,
  imageUrl?: string | null,
): PreviewPoint {
  const id = photoIdFor(imageUrl);
  const profile = (id && PHOTO_PROFILES[id]) || DEFAULT_PROFILE;
  return profile[placement];
}

export function placementTextSizeClass(placement: PlacementValue): string {
  switch (placement) {
    case "left-chest":
      return "text-sm sm:text-base";
    case "center-back":
      return "text-3xl sm:text-4xl";
    case "center-front":
    default:
      return "text-xl sm:text-2xl";
  }
}

// Picks a checkmark color that stays visible against a swatch of any
// lightness, so the "selected" indicator never blends into the swatch.
export function isLightColor(hex?: string | null): boolean {
  if (!hex) return true;
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return true;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}
