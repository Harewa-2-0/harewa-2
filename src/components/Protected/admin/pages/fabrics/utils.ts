// Best-effort mapping from hex to nearest common color name; fallback to hex
// This is lightweight and UI-focused; backend receives the resulting name string.

type NamedColor = { name: string; hex: string };

const NAMED_COLORS: NamedColor[] = [
  { name: 'Black', hex: '#000000' },
  { name: 'Navy Blue', hex: '#000080' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Royal Blue', hex: '#4169E1' },
  { name: 'Sky Blue', hex: '#87CEEB' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Light Gray', hex: '#D3D3D3' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Green', hex: '#008000' },
  { name: 'Forest Green', hex: '#228B22' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Violet', hex: '#8A2BE2' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Turquoise', hex: '#40E0D0' },
];

function hexToRgb(hex: string) {
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function colorDistance(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

export function colorHexToName(hex: string): string {
  try {
    const target = hexToRgb(hex);
    let best: { name: string; dist: number } | null = null;
    for (const c of NAMED_COLORS) {
      const d = colorDistance(target, hexToRgb(c.hex));
      if (!best || d < best.dist) best = { name: c.name, dist: d };
    }
    return best?.name || hex;
  } catch {
    return hex;
  }
}


