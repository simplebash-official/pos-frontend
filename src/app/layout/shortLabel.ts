/** "සාරාංශය (Overview)" -> short "සාරාංශය"; "Quotations (මිල ගණන් කොළ)" -> "මිල ගණන් කොළ". */
export function shortLabel(label: string): string {
  const m = /^(.*?)\s*\((.+)\)$/.exec(label);
  if (!m) return label;
  return /^[ -~]+$/.test(m[1]) ? m[2] : m[1];
}
