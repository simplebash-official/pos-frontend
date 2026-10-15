/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { IconBox } from '@tabler/icons-react';
import { installDrawerTestEnv } from '../testEnv';
import { TestHarness } from '../TestHarness';
import { AnimatedTabs } from '../AnimatedTabs';
import { DrawerFooter } from '../DrawerFooter';
import { IconAction } from '../IconAction';
import { Figure, KpiStrip, KpiTile, RangeFigure } from '../KpiStrip';
import { RichDrawer } from '../RichDrawer';

installDrawerTestEnv();

describe('drawer kit', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const show = async (node: ReactNode, role = 'admin') => {
    await act(async () => {
      root.render(<TestHarness role={role}>{node}</TestHarness>);
    });
  };
  const text = () => document.body.textContent ?? '';
  const buttons = () => Array.from(document.body.querySelectorAll('button'));

  describe('RangeFigure', () => {
    const props = { color: 'blue', singleHint: 'per unit', emptyHint: 'No stock' };

    it('spells a range out as lowest and highest', async () => {
      await show(<RangeFigure range={{ min: 4_000, max: 4_800 }} {...props} />);
      expect(text()).toContain('Lowest');
      expect(text()).toContain('Rs. 40.00');
      expect(text()).toContain('Highest');
      expect(text()).toContain('Rs. 48.00');
      expect(text()).not.toContain('per unit');
    });

    it('shows one amount once, with its hint', async () => {
      await show(<RangeFigure range={{ min: 4_800, max: 4_800 }} {...props} />);
      expect(text()).toContain('Rs. 48.00');
      expect(text()).toContain('per unit');
      expect(text()).not.toContain('Lowest');
    });

    it('shows a dash and the empty hint when there is nothing', async () => {
      await show(<RangeFigure range={null} {...props} />);
      expect(text()).toContain('—');
      expect(text()).toContain('No stock');
    });
  });

  it('KpiStrip lays its tiles in the strip class', async () => {
    await show(
      <KpiStrip>
        <KpiTile icon={<IconBox size={16} />} color="blue" label="Stock">
          <Figure value="20 units" hint="Min 8" color="blue" />
        </KpiTile>
      </KpiStrip>
    );
    expect(container.querySelector('.rich-drawer-kpis')).not.toBeNull();
    expect(text()).toContain('Stock');
    expect(text()).toContain('20 units');
  });

  it('IconAction is named by its label and calls back, unless disabled', async () => {
    const onClick = vi.fn();
    await show(
      <>
        <IconAction
          kind="edit"
          label="Change price"
          icon={<IconBox size={16} />}
          onClick={onClick}
        />
        <IconAction
          kind="danger"
          label="Take stock out"
          icon={<IconBox size={16} />}
          onClick={onClick}
          disabled
        />
      </>
    );
    const edit = document.body.querySelector(
      'button[aria-label="Change price"]'
    ) as HTMLButtonElement;
    const danger = document.body.querySelector(
      'button[aria-label="Take stock out"]'
    ) as HTMLButtonElement;
    await act(async () => edit.click());
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(danger.disabled).toBe(true);
  });

  it('DrawerFooter puts the destructive action at the start and the rest at the end', async () => {
    await show(
      <DrawerFooter start={<button>Delete</button>}>
        <button>Close</button>
        <button>Edit</button>
      </DrawerFooter>
    );
    const labels = buttons().map((b) => b.textContent);
    expect(labels).toEqual(['Delete', 'Close', 'Edit']);
  });

  describe('AnimatedTabs', () => {
    const Demo = ({ onChange }: { onChange?: (v: string) => void }) => {
      const [value, setValue] = useState<'a' | 'b'>('a');
      return (
        <AnimatedTabs
          value={value}
          onChange={(v) => {
            setValue(v);
            onChange?.(v);
          }}
          tabs={[
            { value: 'a', label: 'Alpha', icon: <IconBox size={16} />, count: 3 },
            { value: 'b', label: 'Beta', icon: <IconBox size={16} />, count: 0 },
          ]}
        >
          {(v) => <div>{`panel ${v}`}</div>}
        </AnimatedTabs>
      );
    };

    it('shows the active tab panel, counts, and switches on click', async () => {
      const onChange = vi.fn();
      await show(<Demo onChange={onChange} />);
      expect(text()).toContain('Alpha');
      expect(text()).toContain('3');
      expect(text()).toContain('panel a');

      const beta = Array.from(document.body.querySelectorAll('[role="tab"]')).find((el) =>
        el.textContent?.includes('Beta')
      ) as HTMLElement;
      await act(async () => beta.click());
      await act(async () => {
        await vi.waitFor(() => expect(text()).toContain('panel b'), { timeout: 2000 });
      });
      expect(onChange).toHaveBeenCalledWith('b');
    });

    it('links the panel to its tab for assistive technology', async () => {
      await show(<Demo />);
      const panel = document.body.querySelector('[role="tabpanel"]') as HTMLElement;
      const labelledBy = panel.getAttribute('aria-labelledby') as string;
      expect(document.getElementById(labelledBy)?.textContent).toContain('Alpha');
    });
  });

  describe('RichDrawer', () => {
    const Drawer = ({ data, opened }: { data: string | null; opened: boolean }) => (
      <RichDrawer
        data={data}
        opened={opened}
        onClose={() => undefined}
        width="wide"
        title={{ icon: <IconBox size={20} />, text: 'Things', subtitle: 'All the things' }}
        footer={(item) => <DrawerFooter>{`footer ${item}`}</DrawerFooter>}
      >
        {(item) => <div>{`body ${item}`}</div>}
      </RichDrawer>
    );

    it('renders header, content and footer, with the width class', async () => {
      await show(<Drawer data="one" opened />);
      expect(text()).toContain('Things');
      expect(text()).toContain('All the things');
      expect(text()).toContain('body one');
      expect(text()).toContain('footer one');
      expect(document.body.querySelector('.rich-drawer--wide')).not.toBeNull();
    });

    it('keeps showing the last item while the drawer is still open without data', async () => {
      await show(<Drawer data="one" opened />);
      await show(<Drawer data={null} opened />);
      expect(text()).toContain('body one');
    });

    it('shows nothing before any item was ever given', async () => {
      await show(<Drawer data={null} opened />);
      expect(text()).not.toContain('body');
    });
  });
});
