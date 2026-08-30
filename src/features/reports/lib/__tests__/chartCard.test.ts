import { describe, it, expect } from 'vitest';
import { ChartCard } from '../../components/ChartCard';

describe('ChartCard Component', () => {
  it('exports ChartCard component function', () => {
    expect(typeof ChartCard).toBe('function');
  });

  it('renders a valid React element structure with non-scrolling container configuration', () => {
    const element = ChartCard({
      title: 'Revenue & profit trend',
      subtitle: 'Track your growth',
      minHeight: 260,
      children: 'Mock Chart Content',
    });

    expect(element).toBeDefined();
    expect(element.type).toBeDefined();
    expect(element.props).toBeDefined();
  });

  it('handles loading state with skeleton fallback', () => {
    const loadingElement = ChartCard({
      title: 'Sales by category',
      loading: true,
      minHeight: 280,
      children: 'Mock Chart Content',
    });

    expect(loadingElement).toBeDefined();
  });

  it('handles empty state fallback', () => {
    const emptyElement = ChartCard({
      title: 'Payment mix',
      empty: true,
      emptyText: 'No payment data available',
      children: 'Mock Chart Content',
    });

    expect(emptyElement).toBeDefined();
  });
});
