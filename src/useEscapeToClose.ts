import { useEffect } from 'react';

function isTopmostDialog(dialogEl: HTMLElement | null): boolean {
  if (!dialogEl) return false;
  const dialogs = document.querySelectorAll('[role="dialog"]');
  return dialogs[dialogs.length - 1] === dialogEl;
}

export function useEscapeToClose(
  open: boolean,
  onClose: () => void,
  dialogRef: React.RefObject<HTMLElement | null>
): void {
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (!isTopmostDialog(dialogRef.current)) return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', handleKey, true);
    return () => {
      window.removeEventListener('keydown', handleKey, true);
    };
  }, [open, onClose, dialogRef]);
}
