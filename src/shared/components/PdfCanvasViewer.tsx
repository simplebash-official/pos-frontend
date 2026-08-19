import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  Box,
  Group,
  ActionIcon,
  Text,
  Loader,
  Stack,
  Tooltip,
  Paper,
  Divider,
  Button,
} from '@mantine/core';
import {
  IconMinus,
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
  IconAlertCircle,
  IconArrowsMaximize,
} from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface PdfCanvasViewerProps {
  blob: Blob | null;
  loading?: boolean;
  error?: boolean;
  /** Label used in the empty/error states and the page-count readout. */
  documentLabel?: string;
  /** Initial scale (default: 1 for 100%) */
  initialScale?: number;
  /** Initial auto-fit mode (default: false) */
  initialAutoFit?: boolean;
}

const ZOOM_STEP = 0.15;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 3;

// A themed, windowless in-app PDF renderer built on pdf.js's canvas API.
// Displays the document centered with all pages vertically scrollable and a floating HUD controller.

interface PdfPageCanvasProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  registerPageRef: (pageNumber: number, el: HTMLDivElement | null) => void;
}

const PdfPageCanvas = ({ pdfDoc, pageNumber, scale, registerPageRef }: PdfPageCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const viewport = page.getViewport({ scale });
        const outputScale = window.devicePixelRatio || 1;

        setDimensions({ width: viewport.width, height: viewport.height });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

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
        if (!cancelled && e instanceof Error && e.name !== 'RenderingCancelledException') {
          console.error(`Failed to render PDF page ${pageNumber}:`, e);
        }
      }
    };

    void renderPage();
    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [pdfDoc, pageNumber, scale]);

  return (
    <Box
      ref={(el) => registerPageRef(pageNumber, el)}
      data-page-number={pageNumber}
      style={{
        position: 'relative',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.18)',
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
        flexShrink: 0,
        width: dimensions ? `${dimensions.width}px` : undefined,
        height: dimensions ? `${dimensions.height}px` : undefined,
        minHeight: dimensions ? `${dimensions.height}px` : 200,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: dimensions ? `${dimensions.width}px` : '100%',
          height: dimensions ? `${dimensions.height}px` : '100%',
          borderRadius: 2,
        }}
      />
    </Box>
  );
};

export const PdfCanvasViewer = ({
  blob,
  loading,
  error,
  documentLabel,
  initialScale = 1,
  initialAutoFit = false,
}: PdfCanvasViewerProps) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [activePage, setActivePage] = useState(1);
  const [scale, setScale] = useState(initialScale);
  const [autoFit, setAutoFit] = useState(initialAutoFit);
  const [loadError, setLoadError] = useState(false);

  const registerPageRef = (pageNumber: number, el: HTMLDivElement | null) => {
    pageRefs.current[pageNumber] = el;
  };

  // Reset view state synchronously during render when the blob identity changes.
  const [prevBlob, setPrevBlob] = useState(blob);
  if (blob !== prevBlob) {
    setPrevBlob(blob);
    setPdfDoc(null);
    setActivePage(1);
    setAutoFit(initialAutoFit);
    setScale(initialScale);
    setLoadError(false);
  }

  // Load the document whenever the blob changes.
  useEffect(() => {
    pageRefs.current = {};
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

  // Recompute the fit-to-width scale when autoFit is enabled.
  useEffect(() => {
    if (!autoFit || !pdfDoc || !containerRef.current) return;
    const container = containerRef.current;
    let cancelled = false;

    const fit = async () => {
      try {
        const page = await pdfDoc.getPage(1);
        if (cancelled) return;
        const unscaled = page.getViewport({ scale: 1 });
        const availableWidth = container.clientWidth - (isMobile ? 32 : 64);
        const fitScale = Math.max(
          ZOOM_MIN,
          Math.min(ZOOM_MAX, +(availableWidth / unscaled.width).toFixed(2))
        );
        setScale(fitScale);
      } catch {
        // Ignore cancelled or load errors
      }
    };

    void fit();
    const observer = new ResizeObserver(() => void fit());
    observer.observe(container);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [autoFit, pdfDoc, isMobile]);

  const pageCount = pdfDoc?.numPages ?? 0;
  const showEmpty = loading || error || loadError || !pdfDoc;

  // Track active visible page while scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container || pageCount <= 1) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestPage = activePage;
        let maxRatio = 0;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            const num = Number(entry.target.getAttribute('data-page-number'));
            if (num) bestPage = num;
          }
        }
        if (maxRatio > 0) {
          setActivePage(bestPage);
        }
      },
      {
        root: container,
        threshold: [0.1, 0.3, 0.5, 0.7, 0.9],
      }
    );

    Object.values(pageRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pageCount, pdfDoc, scale, activePage]);

  const scrollToPage = (targetPage: number) => {
    const clamped = Math.max(1, Math.min(pageCount, targetPage));
    const targetEl = pageRefs.current[clamped];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActivePage(clamped);
    }
  };

  const resetTo100 = () => {
    setAutoFit(false);
    setScale(1);
  };

  const zoomIn = () => {
    setAutoFit(false);
    setScale((s) => Math.min(ZOOM_MAX, +(s + ZOOM_STEP).toFixed(2)));
  };

  const zoomOut = () => {
    setAutoFit(false);
    setScale((s) => Math.max(ZOOM_MIN, +(s - ZOOM_STEP).toFixed(2)));
  };

  const toggleFit = () => {
    if (autoFit) {
      resetTo100();
    } else {
      setAutoFit(true);
    }
  };

  return (
    <Box
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-app)',
      }}
    >
      {/* Floating HUD Controller */}
      {!showEmpty && (
        <Paper
          withBorder
          shadow="xs"
          style={{
            position: 'absolute',
            top: isMobile ? 8 : 14,
            left: isMobile ? 8 : 14,
            zIndex: 10,
            backgroundColor: 'var(--bg-card)',
            backdropFilter: 'blur(8px)',
            padding: '4px 6px',
          }}
        >
          <Group gap={4} wrap="nowrap" align="center">
            <Tooltip label="Zoom out">
              <ActionIcon
                variant="subtle"
                color="gray"
                size={isMobile ? 36 : 28}
                disabled={scale <= ZOOM_MIN}
                onClick={zoomOut}
                aria-label="Zoom out"
              >
                <IconMinus size={14} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label={scale === 1 && !autoFit ? 'Zoom 100%' : 'Reset to 100%'}>
              <Button
                variant="subtle"
                color="gray"
                size="compact-xs"
                onClick={resetTo100}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '0 6px',
                  minWidth: 44,
                  height: isMobile ? 36 : 28,
                  color: 'var(--text-primary)',
                }}
              >
                {Math.round(scale * 100)}%
              </Button>
            </Tooltip>

            <Tooltip label="Zoom in">
              <ActionIcon
                variant="subtle"
                color="gray"
                size={isMobile ? 36 : 28}
                disabled={scale >= ZOOM_MAX}
                onClick={zoomIn}
                aria-label="Zoom in"
              >
                <IconPlus size={14} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label={autoFit ? 'Fit to width (active)' : 'Fit to width'}>
              <ActionIcon
                variant={autoFit ? 'light' : 'subtle'}
                color={autoFit ? 'blue' : 'gray'}
                size={isMobile ? 36 : 28}
                onClick={toggleFit}
                aria-label="Fit to width"
              >
                <IconArrowsMaximize size={14} />
              </ActionIcon>
            </Tooltip>

            {pageCount > 1 && (
              <>
                <Divider orientation="vertical" my={4} color="var(--border)" />
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size={isMobile ? 36 : 28}
                  disabled={activePage <= 1}
                  onClick={() => scrollToPage(activePage - 1)}
                  aria-label="Previous page"
                >
                  <IconChevronLeft size={14} />
                </ActionIcon>
                <Text
                  size="xs"
                  fw={600}
                  style={{ padding: '0 4px', textAlign: 'center', whiteSpace: 'nowrap' }}
                >
                  {activePage} / {pageCount}
                </Text>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size={isMobile ? 36 : 28}
                  disabled={activePage >= pageCount}
                  onClick={() => scrollToPage(activePage + 1)}
                  aria-label="Next page"
                >
                  <IconChevronRight size={14} />
                </ActionIcon>
              </>
            )}
          </Group>
        </Paper>
      )}

      {/* Scrollable Viewport */}
      <Box
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
          position: 'relative',
        }}
      >
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

        {!loading && !error && !loadError && pdfDoc && (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '100%',
              minHeight: '100%',
              padding: isMobile ? 16 : 32,
              gap: isMobile ? 16 : 24,
              boxSizing: 'border-box',
            }}
          >
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((pNum) => (
              <PdfPageCanvas
                key={`${pdfDoc.fingerprints?.[0] || 'doc'}-p${pNum}`}
                pdfDoc={pdfDoc}
                pageNumber={pNum}
                scale={scale}
                registerPageRef={registerPageRef}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};
