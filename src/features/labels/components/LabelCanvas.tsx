import { t } from '@/shared/i18n/t';
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Box } from '@mantine/core';
import {
  NUDGE_BIG_MM,
  NUDGE_MM,
  clampElement,
  elementTitle,
  moveElement,
  snapMm,
  snapToCenter,
  type CenterGuides,
  type LabelSize,
} from '../lib/labelGeometry';
import { sampleText } from '../lib/labelSample';
import type { LabelElement, LabelSample } from '../types';

/** 1 pt is this many millimetres. */
const PT_TO_MM = 25.4 / 72;
const HANDLE_PX = 14;

interface DragState {
  id: string;
  mode: 'move' | 'resize';
  startX: number;
  startY: number;
  origin: LabelElement;
}

export interface LabelCanvasProps {
  label: LabelSize;
  elements: LabelElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** `tag` names the change (`move:<id>`, `resize:<id>`, `nudge:<id>`) so one drag is one undo step. */
  onChange: (elements: LabelElement[], tag: string) => void;
  onRemove: (id: string) => void;
  sample: LabelSample;
  shopName: string;
  /** Screen pixels per millimetre. */
  scale: number;
}

const ElementFace = ({
  element,
  sample,
  shopName,
  scale,
}: {
  element: LabelElement;
  sample: LabelSample;
  shopName: string;
  scale: number;
}) => {
  switch (element.type) {
    case 'text':
      return (
        <span
          style={{
            display: 'block',
            width: '100%',
            overflow: 'hidden',
            lineHeight: 1.15,
            fontSize: element.fontSizePt * PT_TO_MM * scale,
            fontWeight: element.bold ? 700 : 400,
            textAlign: element.align,
          }}
        >
          {sampleText(element, sample, shopName)}
        </span>
      );
    case 'barcode': {
      const captionPx = element.showValue ? (element.fontSizePt * 1.25 + 2) * PT_TO_MM * scale : 0;
      return (
        <>
          <span
            style={{
              display: 'block',
              height: Math.max(element.heightMm * scale - captionPx, 2),
              backgroundImage:
                'repeating-linear-gradient(90deg, #000 0 2px, #fff 2px 3px, #000 3px 4px, #fff 4px 7px)',
            }}
          />
          {element.showValue && (
            <span
              style={{
                display: 'block',
                textAlign: 'center',
                fontSize: element.fontSizePt * PT_TO_MM * scale,
                lineHeight: 1.2,
              }}
            >
              {sample.code}
            </span>
          )}
        </>
      );
    }
    case 'qr': {
      const side = Math.min(element.widthMm, element.heightMm) * scale;
      return (
        <span
          style={{
            display: 'block',
            width: side,
            height: side,
            margin: '0 auto',
            backgroundImage: 'conic-gradient(#000 25%, #fff 0 50%, #000 0 75%, #fff 0)',
            backgroundSize: `${Math.max(side / 9, 3)}px ${Math.max(side / 9, 3)}px`,
          }}
        />
      );
    }
    case 'line':
      return (
        <span style={{ display: 'block', width: '100%', height: '100%', background: '#000' }} />
      );
  }
};

const NO_GUIDES: CenterGuides = { vertical: false, horizontal: false };

/**
 * The label drawn to scale. Items drag to move and drag their corner handle to
 * resize, both snapping to half a millimetre; a moved item is pulled onto the
 * label's centre lines, which show as guides while it sits on them. Arrow keys
 * nudge the selected item (Shift for bigger steps) and Delete removes it. The
 * sheet is always white with black ink in both themes because it stands for
 * the paper.
 */
export const LabelCanvas = ({
  label,
  elements,
  selectedId,
  onSelect,
  onChange,
  onRemove,
  sample,
  shopName,
  scale,
}: LabelCanvasProps) => {
  const drag = useRef<DragState | null>(null);
  const [guides, setGuides] = useState<CenterGuides>(NO_GUIDES);

  const replace = (next: LabelElement, tag: string) =>
    onChange(
      elements.map((element) => (element.id === next.id ? next : element)),
      `${tag}:${next.id}`
    );

  const begin = (
    event: PointerEvent<HTMLElement>,
    element: LabelElement,
    mode: DragState['mode']
  ) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect(element.id);
    drag.current = {
      id: element.id,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      origin: element,
    };
  };

  const track = (event: PointerEvent<HTMLElement>) => {
    const state = drag.current;
    if (state === null) return;
    const dx = (event.clientX - state.startX) / scale;
    const dy = (event.clientY - state.startY) / scale;
    if (state.mode === 'move') {
      const snapped = snapToCenter(
        clampElement(
          {
            ...state.origin,
            xMm: snapMm(state.origin.xMm + dx),
            yMm: snapMm(state.origin.yMm + dy),
          },
          label
        ),
        label
      );
      setGuides(snapped.guides);
      replace(snapped.element, 'move');
      return;
    }
    replace(
      clampElement(
        {
          ...state.origin,
          widthMm: snapMm(state.origin.widthMm + dx),
          heightMm: snapMm(state.origin.heightMm + dy),
        },
        label
      ),
      'resize'
    );
  };

  const finish = () => {
    drag.current = null;
    setGuides(NO_GUIDES);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>, element: LabelElement) => {
    const step = event.shiftKey ? NUDGE_BIG_MM : NUDGE_MM;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (move !== undefined) {
      event.preventDefault();
      replace(moveElement(element, move[0], move[1], label), 'nudge');
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      onRemove(element.id);
    }
  };

  return (
    <Box
      role="group"
      aria-label={t('Label layout')}
      onPointerDown={() => onSelect(null)}
      style={{
        position: 'relative',
        width: label.widthMm * scale,
        height: label.heightMm * scale,
        background: '#fff',
        color: '#000',
        outline: '1px solid var(--border-strong)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.18)',
        touchAction: 'none',
        flexShrink: 0,
      }}
    >
      {elements.map((element) => {
        const selected = element.id === selectedId;
        return (
          <div
            key={element.id}
            role="button"
            tabIndex={0}
            aria-label={elementTitle(element)}
            aria-pressed={selected}
            onPointerDown={(event) => begin(event, element, 'move')}
            onPointerMove={track}
            onPointerUp={finish}
            onPointerCancel={finish}
            onKeyDown={(event) => onKeyDown(event, element)}
            onFocus={() => onSelect(element.id)}
            style={{
              position: 'absolute',
              left: element.xMm * scale,
              top: element.yMm * scale,
              width: element.widthMm * scale,
              height: element.heightMm * scale,
              overflow: 'hidden',
              cursor: 'move',
              touchAction: 'none',
              outline: selected
                ? '2px solid var(--mantine-color-blue-6)'
                : '1px dashed rgba(0, 0, 0, 0.25)',
              outlineOffset: 0,
            }}
          >
            <ElementFace element={element} sample={sample} shopName={shopName} scale={scale} />
          </div>
        );
      })}
      {guides.vertical && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: (label.widthMm / 2) * scale,
            top: 0,
            bottom: 0,
            borderLeft: '1px dashed var(--mantine-color-blue-6)',
            pointerEvents: 'none',
          }}
        />
      )}
      {guides.horizontal && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: (label.heightMm / 2) * scale,
            left: 0,
            right: 0,
            borderTop: '1px dashed var(--mantine-color-blue-6)',
            pointerEvents: 'none',
          }}
        />
      )}
      {elements
        .filter((element) => element.id === selectedId)
        .map((element) => (
          <div
            key={`handle-${element.id}`}
            aria-hidden
            onPointerDown={(event) => begin(event, element, 'resize')}
            onPointerMove={track}
            onPointerUp={finish}
            onPointerCancel={finish}
            style={{
              position: 'absolute',
              left: (element.xMm + element.widthMm) * scale - HANDLE_PX / 2,
              top: (element.yMm + element.heightMm) * scale - HANDLE_PX / 2,
              width: HANDLE_PX,
              height: HANDLE_PX,
              background: 'var(--mantine-color-blue-6)',
              border: '2px solid #fff',
              borderRadius: 3,
              cursor: 'nwse-resize',
              touchAction: 'none',
            }}
          />
        ))}
    </Box>
  );
};
