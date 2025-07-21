// hooks/useDeleteShortcut.ts
import { useEffect } from "react";

export const useDeleteShortcut = (
    activeNoteId: string | null,
    deleteNote: (id: string) => void,
    clearActive: () => void
) => {
    useEffect(() => {
        const handleDeleteKey = (e: KeyboardEvent) => {
            const active = document.activeElement;
            const isEditing =
                active?.tagName === "TEXTAREA" ||
                active?.tagName === "INPUT" ||
                (active as HTMLElement)?.isContentEditable;

            if (isEditing) return;

            if (activeNoteId && (e.key === "Backspace" || e.key === "Delete")) {
                e.preventDefault();
                deleteNote(activeNoteId);
                clearActive();
            }
        };

        window.addEventListener("keydown", handleDeleteKey);
        return () => window.removeEventListener("keydown", handleDeleteKey);
    }, [activeNoteId, deleteNote, clearActive]);
};
