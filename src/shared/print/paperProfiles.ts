export interface PaperProfile {
  id: 'thermal80' | 'thermal58' | 'a4';
  name: string;
  widthMm: number;
  printableWidthMm: number;
  charsPerLine: number;
  isContinuous: boolean;
  paddingMm: number;
  fontSizePx: number;
  lineHeight: number;
  fontFamily: string;
}

export const PAPER_PROFILES: Record<string, PaperProfile> = {
  thermal80: {
    id: 'thermal80',
    name: '80mm Thermal Receipt',
    widthMm: 80,
    printableWidthMm: 72,
    charsPerLine: 42,
    isContinuous: true,
    paddingMm: 2,
    fontSizePx: 12,
    lineHeight: 1.3,
    fontFamily: "monospace, 'Courier New', Courier",
  },
  thermal58: {
    id: 'thermal58',
    name: '58mm Thermal Receipt',
    widthMm: 58,
    printableWidthMm: 48,
    charsPerLine: 32,
    isContinuous: true,
    paddingMm: 1,
    fontSizePx: 11,
    lineHeight: 1.25,
    fontFamily: "monospace, 'Courier New', Courier",
  },
  a4: {
    id: 'a4',
    name: 'A4 Standard Invoice',
    widthMm: 210,
    printableWidthMm: 180,
    charsPerLine: 80,
    isContinuous: false,
    paddingMm: 15,
    fontSizePx: 13,
    lineHeight: 1.4,
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
};
