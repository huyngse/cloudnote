// 📋 useClipboardHandler.ts
// This custom hook listens for the paste keyboard shortcut (Ctrl+V or Cmd+V) and creates a new note
// if there's an image or text in the clipboard! So handy for quickly saving ideas~! (☆▽☆)

import { useEffect, type Dispatch, type SetStateAction } from "react";
import { createNote, toStoredNote } from "@/utils/noteHelpers"; // Helper to create and convert notes!
import { saveNote } from "@/utils/indexedDbUtils"; // For saving the note to IndexedDB (like a local camp log! ⛺📓)
import { type HeliodorNoteProps } from "@/components/heliodor/HeliodorNote"; // Type for each note

// This hook takes in a setter for notes and a function to get the center position on screen!
export const useClipboardHandler = (
    setNotes: Dispatch<SetStateAction<HeliodorNoteProps[]>>, // Updates the notes state
    getCenterPosition: () => { x: number; y: number } | null // Gets where to place the note!
) => {
    useEffect(() => {
        // 🍝 Handler for paste shortcut
        const handlePasteShortcut = async (e: KeyboardEvent) => {
            // First, check if user is typing in an input, textarea, or contentEditable element
            const active = document.activeElement;
            const isEditing =
                active?.tagName === "TEXTAREA" ||
                active?.tagName === "INPUT" ||
                (active as HTMLElement)?.isContentEditable;

            if (isEditing) return; // If editing, don't hijack the paste! Respect the user~! (｡•̀ᴗ-)✧

            // Check for Ctrl+V or Cmd+V (Mac users included~! 🍎)
            if ((e.ctrlKey || e.metaKey) && e.key === "v") {
                try {
                    // Try reading from the clipboard!
                    const clipboardItems = await navigator.clipboard.read();

                    // Loop through all items in the clipboard
                    for (const item of clipboardItems) {
                        for (const type of item.types) {
                            const blob = await item.getType(type); // Get the actual data

                            // 🖼️ If it's an image, convert it to a Data URL and make a new note!
                            if (type.startsWith("image/")) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                    const newNote = createNote(getCenterPosition, {
                                        content: reader.result as string,
                                    });
                                    setNotes((prev) => [...prev, newNote]); // Add the new note!
                                    saveNote(toStoredNote(newNote)); // Save it to IndexedDB!
                                };
                                reader.readAsDataURL(blob); // Start reading the image!
                                return;
                            }

                            // 📄 If it's plain text, add it as a text note
                            else if (type === "text/plain") {
                                const text = await blob.text();
                                if (text.trim()) {
                                    const newNote = createNote(getCenterPosition, {
                                        content: text,
                                    });
                                    setNotes((prev) => [...prev, newNote]); // Add the note~
                                    saveNote(toStoredNote(newNote)); // And save it too!
                                    return;
                                }
                            }
                        }
                    }
                } catch (err) {
                    // If there's an error, log it to the console
                    console.error("Clipboard access failed:", err);
                }
            }
        };

        // ⛺ Add the event listener when the hook is mounted!
        window.addEventListener("keydown", handlePasteShortcut);

        // ⛺ Clean it up when the component unmounts
        return () => window.removeEventListener("keydown", handlePasteShortcut);
    }, [getCenterPosition, setNotes]); // Make sure the effect updates if these change!
};
