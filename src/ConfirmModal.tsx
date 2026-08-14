import { useEffect, useRef, type ReactNode } from 'react';
import { useEscapeToClose } from './useEscapeToClose.ts';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = 'confirm-modal-title';

  useEscapeToClose(open, onClose, dialogRef);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    cancelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const confirmClass = destructive
    ? 'border-error/40 bg-error/10 text-error hover:bg-error/20 focus-visible:bg-error/20'
    : 'border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 focus-visible:bg-accent/20';

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="flex w-full max-w-sm flex-col rounded-lg border border-border bg-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="border-b border-border px-5 py-4">
          <h2 id={titleId} className="m-0 text-lg font-semibold">
            {title}
          </h2>
        </div>

        <div className="px-5 py-4 text-sm text-text">{message}</div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md border border-border bg-transparent px-4 text-sm font-medium text-text transition-colors hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex h-9 items-center rounded-md border px-4 text-sm font-semibold transition-colors focus-visible:outline-none ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
