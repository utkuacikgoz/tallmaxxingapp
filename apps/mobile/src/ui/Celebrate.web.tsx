import { memo } from 'react';

/**
 * Web (previews and QA only): Skia's CanvasKit isn't loaded in the browser, so the confetti burst
 * is skipped here. iOS and Android use Celebrate.tsx.
 */
export const Celebrate = memo(function Celebrate(_props: { onEnd?: () => void }) {
  return null;
});
