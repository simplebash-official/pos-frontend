import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Box, Group, ActionIcon, Text, Loader, Stack, Tooltip } from '@mantine/core';
import {
  IconMinus,
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
  IconAlertCircle,
  IconArrowsMaximize,
} from '@tabler/icons-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface PdfCanvasViewerProps {
  blob: Blob | null;
  loading?: boolean;
  error?: boolean;
  /** Label used in the empty/error states and the page-count readout. */
  documentLabel?: string;
}

const ZOOM_STEP = 0.15;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 3;

// A themed, in-app PDF renderer built on pdf.js's canvas API — used instead
// of a raw `<iframe src={blobUrl}>` because the browser's native PDF viewer
// chrome (its own dark toolbar, thumbnail rail, page-fit controls) reads as
// a foreign app bolted onto the page rather than part of this one. This
// component owns rendering, zoom and pagination itself so the toolbar can
// match the rest of the UI (Mantine tokens, light/dark aware) — see
// CLAUDE.md's "Center modals" / dark-mode-safe styling rules.
export const PdfCanvasViewer = ({ blob, loading, error, documentLabel }: PdfCanvasViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(1);
  const [autoFit, setAutoFit] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Reset view state synchronously during render when the blob identity
  // changes — React's documented alternative to resetting state from an
  // effect (avoids an extra render pass and the "setState in effect" smell).
  const [prevBlob, setPrevBlob] = useState(blob);
  if (blob !== prevBlob) {
    setPrevBlob(blob);
    setPdfDoc(null);
    setPageNum(1);
    setAutoFit(true);
    setLoadError(false);
  }

  // Load the document whenever the blob changes. Every state update here
  // happens inside a promise callback (after the actual I/O), not
  // synchronously in the effect body. `PDFDocumentProxy` (the resolved
  // document) has no `destroy()` of its own — only the loading task does —
  // so that's what cleanup tears down.
  useEffect(() => {
    if (!blob) return;
    let cancelled = false;
    let loadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;

    blob.arrayBuffer().then((data) => {
      if (cancelled) return;
      loadingTask = pdfjsLib.getDocument({ data });
      loadingTask.promise
        .then((doc) => {
          if (!cancelled) setPdfDoc(doc);
        })
        .catch(() => {
          if (!cancelled) setLoadError(true);
        });
    });

    return () => {
      cancelled = true;
      void loadingTask?.destroy();
    };
  }, [blob]);

  // Recompute the fit-to-width scale when the doc/page/container size
  // changes, but only while the user hasn't manually zoomed.
  useEffect(() => {
    if (!autoFit || !pdfDoc || !containerRef.current) return;
    const container = containerRef.current;
    let cancelled = false;

    const fit = async () => {
      const page = await pdfDoc.getPage(pageNum);
      if (cancelled) return;
      const unscaled = page.getViewport({ scale: 1 });
      const availableWidth = container.clientWidth - 48;
      const fitScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, availableWidth / unscaled.width));
      setScale(fitScale);
    };

    void fit();
    const observer = new ResizeObserver(() => void fit());
    observer.observe(container);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [autoFit, pdfDoc, pageNum]);

  // Paint the current page to the canvas. Defined inline (not via
  // useCallback) and invoked from the effect below — this is imperative DOM
  // synchronization (canvas isn't React state), the textbook valid use of
  // an effect; every setState here also happens after an `await`.
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    let cancelled = false;

    const render = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (cancelled) return;
        const viewport = page.getViewport({ scale });
        const outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        renderTaskRef.current?.cancel();
        const task = page.render({
          canvas,
          canvasContext: context,
          viewport,
          transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
        });
        renderTaskRef.current = task;
        await task.promise;
      } catch (e) {
        // A cancelled render (from a rapid zoom/page change) throws by design — not a real error.
        if (!cancelled && e instanceof Error && e.name !== 'RenderingCancelledException') {
          setLoadError(true);
        }
      }
    };

    void render();
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pageNum, scale]);

  const zoomIn = () => {
    setAutoFit(false);
    setScale((s) => Math.min(ZOOM_MAX, +(s + ZOOM_STEP).toFixed(2)));
  };
  const zoomOut = () => {
    setAutoFit(false);
    setScale((s) => Math.max(ZOOM_MIN, +(s - ZOOM_STEP).toFixed(2)));
  };
  const resetFit = () => setAutoFit(true);

  const pageCount = pdfDoc?.numPages ?? 0;
  const showEmpty = loading || error || loadError || !pdfDoc;

  return (
    <Stack
      gap={0}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--bg-app)',
        overflow: 'hidden',
      }}
    >
      <Group
        justify="space-between"
        wrap="nowrap"
        style={{
          flexShrink: 0,
          height: 44,
          padding: '0 12px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <Group gap={4} wrap="nowrap">
          <Tooltip label="Zoom out">
            <ActionIcon
              variant="subtle"
              color="gray"
              size={32}
              disabled={showEmpty}
              onClick={zoomOut}
              aria-label="Zoom out"
            >
              <IconMinus size={14} />
            </ActionIcon>
          </Tooltip>
          <Text size="xs" fw={600} style={{ width: 44, textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </Text>
          <Tooltip label="Zoom in">
            <ActionIcon
              variant="subtle"
              color="gray"
              size={32}
              disabled={showEmpty}
              onClick={zoomIn}
              aria-label="Zoom in"
            >
              <IconPlus size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Fit to width">
            <ActionIcon
              variant={autoFit ? 'light' : 'subtle'}
              color={autoFit ? 'blue' : 'gray'}
              size={32}
              disabled={showEmpty}
              onClick={resetFit}
              aria-label="Fit to width"
            >
              <IconArrowsMaximize size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {pageCount > 1 && (
          <Group gap={4} wrap="nowrap">
            <ActionIcon
              variant="subtle"
              color="gray"
              size={32}
              disabled={pageNum <= 1}
              onClick={() => setPageNum((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <IconChevronLeft size={14} />
            </ActionIcon>
            <Text size="xs" fw={600} style={{ width: 60, textAlign: 'center' }}>
              {pageNum} / {pageCount}
            </Text>
            <ActionIcon
              variant="subtle"
              color="gray"
              size={32}
              disabled={pageNum >= pageCount}
              onClick={() => setPageNum((p) => Math.min(pageCount, p + 1))}
              aria-label="Next page"
            >
              <IconChevronRight size={14} />
            </ActionIcon>
          </Group>
        )}
      </Group>

      <Box ref={containerRef} style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {(loading || error || loadError) && (
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {loading ? (
              <Stack align="center" gap="xs">
                <Loader size="sm" />
                <Text size="xs" c="dimmed">
                  Preparing {documentLabel || 'document'}…
                </Text>
              </Stack>
            ) : (
              <Stack align="center" gap="xs">
                <IconAlertCircle size={28} color="var(--mantine-color-red-6)" />
                <Text size="sm" c="red" fw={600}>
                  Could not load the document
                </Text>
                <Text size="xs" c="dimmed">
                  Check your connection and try again.
                </Text>
              </Stack>
            )}
          </Box>
        )}
        {!loading && !error && !loadError && (
          <Box
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: 24,
              minHeight: '100%',
            }}
          >
            <canvas
              ref={canvasRef}
              style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.25)', backgroundColor: '#FFFFFF' }}
            />
          </Box>
        )}
      </Box>
    </Stack>
  );
};
