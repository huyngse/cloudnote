// hooks/useClipboardHandler.ts
import { useEffect, type Dispatch, type SetStateAction } from "react";
import { createNote, toStoredNote } from "@/utils/noteHelpers";
import { saveNote } from "@/utils/indexedDbUtils";
import { type HeliodorNoteProps } from "@/components/heliodor/HeliodorNote";

export const useClipboardHandler = (
    setNotes: Dispatch<SetStateAction<HeliodorNoteProps[]>>,
    getCenterPosition: () => { x: number; y: number } | null
) => {
    useEffect(() => {
        const handlePasteShortcut = async (e: KeyboardEvent) => {
            const active = document.activeElement;
            const isEditing =
                active?.tagName === "TEXTAREA" ||
                active?.tagName === "INPUT" ||
                (active as HTMLElement)?.isContentEditable;

            if (isEditing) return;

            if ((e.ctrlKey || e.metaKey) && e.key === "v") {
                try {
                    const clipboardItems = await navigator.clipboard.read();
                    for (const item of clipboardItems) {
                        for (const type of item.types) {
                            const blob = await item.getType(type);

                            if (type.startsWith("image/")) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                    const newNote = createNote(getCenterPosition, {
                                        content: reader.result as string,
                                    });
                                    setNotes((prev) => [...prev, newNote]);
                                    saveNote(toStoredNote(newNote));
                                };
                                reader.readAsDataURL(blob);
                                return;
                            } else if (type === "text/plain") {
                                const text = await blob.text();
                                if (text.trim()) {
                                    const newNote = createNote(getCenterPosition, {
                                        content: text,
                                    });
                                    setNotes((prev) => [...prev, newNote]);
                                    saveNote(toStoredNote(newNote));
                                    return;
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error("Clipboard access failed:", err);
                }
            }
        };

        window.addEventListener("keydown", handlePasteShortcut);
        return () => window.removeEventListener("keydown", handlePasteShortcut);
    }, [getCenterPosition, setNotes]);
};
