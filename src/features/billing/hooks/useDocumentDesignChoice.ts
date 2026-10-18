import { useState } from 'react';
import type { DocumentDesign, DocumentDesignStatus } from '../api/documentsApi';
import { designToFetch, needsDesignChoice } from '../lib/documentDesign';

interface DesignStatusQuery {
  data?: DocumentDesignStatus;
  isError: boolean;
}

// The "original or current design?" state of one preview: which PDF to fetch (`null` while the
// user is still being asked), whether to show the question, and how the user's answer is kept.
// An answer belongs to one document (`key`) and is dropped when the preview closes, so the next
// reprint asks again.
export const useDocumentDesignChoice = (
  key: string,
  opened: boolean,
  status: DesignStatusQuery
) => {
  const [answer, setAnswer] = useState<{ key: string; design: DocumentDesign } | null>(null);
  if (!opened && answer !== null) {
    setAnswer(null);
  }
  const choice = answer?.key === key ? answer.design : null;

  return {
    /** The PDF to fetch, or `null` until it is known. */
    design: designToFetch(choice, status),
    /** True while the question "original or current?" must be shown. */
    needsChoice: opened && needsDesignChoice(choice, status),
    choose: (design: DocumentDesign) => setAnswer({ key, design }),
  };
};
