/** The layout of a row of choice cards: as many 150px-or-wider columns as fit. */
export const CHOICE_GRID: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
};
