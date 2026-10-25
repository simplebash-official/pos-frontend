/** The layout of a row of choice cards: as many 150px-or-wider columns as fit, all the same height. */
export const CHOICE_GRID: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  // Every row as tall as the tallest card, so the cards line up whichever one is chosen.
  gridAutoRows: '1fr',
};
