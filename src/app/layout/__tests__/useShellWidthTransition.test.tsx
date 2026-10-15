/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createRef, type RefObject } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useShellWidthTransition } from '../useShellWidthTransition';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Frames = Record<string, string>[];

const Harness = ({
  navbarRef,
  mainRef,
  width,
  enabled,
}: {
  navbarRef: RefObject<HTMLDivElement | null>;
  mainRef: RefObject<HTMLDivElement | null>;
  width: number;
  enabled: boolean;
}) => {
  useShellWidthTransition(navbarRef, mainRef, width, enabled);
  return (
    <>
      <div ref={navbarRef} />
      <div ref={mainRef} />
    </>
  );
};

describe('useShellWidthTransition', () => {
  let container: HTMLDivElement;
  let root: Root;
  let calls: { el: Element; frames: Frames; cancel: ReturnType<typeof vi.fn> }[];
  const navbarRef = createRef<HTMLDivElement>();
  const mainRef = createRef<HTMLDivElement>();

  beforeEach(() => {
    calls = [];
    // jsdom has no Web Animations; record what would have been animated.
    Element.prototype.animate = function (this: Element, frames: Keyframe[]) {
      const cancel = vi.fn();
      calls.push({ el: this, frames: frames as Frames, cancel });
      return { finished: new Promise(() => undefined), cancel } as unknown as Animation;
    };
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = (width: number, enabled = true) =>
    act(() =>
      root.render(
        <Harness navbarRef={navbarRef} mainRef={mainRef} width={width} enabled={enabled} />
      )
    );

  const on = (ref: RefObject<HTMLDivElement | null>) => calls.filter((c) => c.el === ref.current);

  it('does nothing on the first render or when the width is unchanged', () => {
    render(250);
    render(250);
    expect(calls).toHaveLength(0);
  });

  it('slides the page and wipes the navbar shut when it shrinks, holding its old width meanwhile', () => {
    render(250);
    render(64);

    expect(on(mainRef)[0].frames).toEqual([
      { transform: 'translateX(186px)' },
      { transform: 'translateX(0)' },
    ]);
    expect(on(navbarRef)[0].frames).toEqual([
      { clipPath: 'inset(0 0 0 0)' },
      { clipPath: 'inset(0 186px 0 0)' },
    ]);
    expect(navbarRef.current!.style.width).toBe('250px');
  });

  it('wipes the navbar open when it grows, without touching its width', () => {
    render(64);
    render(250);

    expect(on(mainRef)[0].frames[0]).toEqual({ transform: 'translateX(-186px)' });
    expect(on(navbarRef)[0].frames).toEqual([
      { clipPath: 'inset(0 186px 0 0)' },
      { clipPath: 'inset(0 0 0 0)' },
    ]);
    expect(navbarRef.current!.style.width).toBe('');
  });

  it('animates only the page when the navbar collapses to or opens from nothing', () => {
    render(64);
    render(0);
    expect(on(mainRef)).toHaveLength(1);
    expect(on(navbarRef)).toHaveLength(0);
  });

  it('does nothing when disabled', () => {
    render(250, false);
    render(64, false);
    expect(calls).toHaveLength(0);
  });

  it('cancels and restores everything when it unmounts mid-animation', () => {
    render(250);
    render(64);
    act(() => root.unmount());

    expect(calls.every((c) => c.cancel.mock.calls.length === 1)).toBe(true);
    expect(document.documentElement.style.overflowX).toBe('');
    root = createRoot(container);
  });
});
