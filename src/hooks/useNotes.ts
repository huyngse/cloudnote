// hooks/useNotes.ts
import { useEffect, useRef, useState } from "react";
import {
    getAllNotes,
    saveNote,
    deleteNoteById,
} from "@/utils/indexedDbUtils";
import { createNote, toStoredNote } from "@/utils/noteHelpers";
import { type HeliodorNoteProps } from "@/components/Note";
import { useEditorContext } from "@/contexts/EditorContext";
import { lockDecorStorageKey } from "@/constants/storageKeys";
import { toast } from "sonner";

export const useNotes = (
    getCenterPosition: () => { x: number; y: number } | null,
) => {
    const [notes, setNotes] = useState<HeliodorNoteProps[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [lockDecor, setLockDecor] = useState<boolean>(() => {
        const saved = localStorage.getItem(lockDecorStorageKey);
        return saved ? JSON.parse(saved) : false;
    });
    const { isEditingNoteRef } = useEditorContext();

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (activeNoteId) {
            isEditingNoteRef.current = true;
        } else {
            isEditingNoteRef.current = false;
        }
    }, [activeNoteId])


    useEffect(() => {
        getAllNotes().then(setNotes).catch(console.error);
    }, []);

    useEffect(() => {
        localStorage.setItem(lockDecorStorageKey, JSON.stringify(lockDecor));
    }, [lockDecor]);

    const addNote = () => {
        const newNote = createNote(getCenterPosition, {});
        setNotes((prev) => [...prev, newNote]);
        saveNote(toStoredNote(newNote));
    };

    const addGuideNote = () => {
        const guideContent = `
        🌤️ Welcome to Cloudnote!
    
        Here's how to use this magical little space:
        • Drag: move around the canvas 🖱️
        • Scroll: zoom in & out 🔍
        • ctrl/cmd + v: paste text or images from clipboard 📋
        • Double-click a note: toggle decor mode 🌸
        • Drag & resize notes, rotate them with the top handle 🔄
        
        Have fun and stay cozy ☁️💛
    `.trim();

        const newNote = createNote(getCenterPosition, {
            width: 500,
            height: 300,
            content: guideContent,
        });

        setNotes((prev) => [...prev, newNote]);
        saveNote(toStoredNote(newNote));
    };

    const updateNote = (id: string, updates: Partial<HeliodorNoteProps>) => {
        setNotes((prev) =>
            prev.map((note) =>
                note.id === id
                    ? (() => {
                        const updated = { ...note, ...updates };
                        saveNote(toStoredNote(updated));
                        return updated;
                    })()
                    : note
            )
        );
        if (updates.decorMode === true) {
            setActiveNoteId(null);
        }
    };

    const deleteNote = (id: string) => {
        setNotes((prev) => prev.filter((note) => note.id !== id));
        isEditingNoteRef.current = false;
        deleteNoteById(id);
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => {
                const newNote = createNote(getCenterPosition, {
                    content: reader.result as string,
                });
                setNotes((prev) => [...prev, newNote]);
                saveNote(toStoredNote(newNote));
            };
            reader.readAsDataURL(file);
        }
    };

    const moveNoteZIndex = (id: string, direction: "up" | "down") => {
        setNotes((prevNotes) => {
            const targetNote = prevNotes.find((n) => n.id === id);
            if (!targetNote) return prevNotes;

            const updatedNotes = [...prevNotes];
            const currentZ = targetNote.zIndex ?? 1;
            const delta = direction === "up" ? 1 : -1;
            const newZ = Math.max(0, currentZ + delta);

            const index = updatedNotes.findIndex((n) => n.id === id);
            updatedNotes[index] = { ...targetNote, zIndex: newZ };
            toast.info(`☁️ moved to layer ${newZ}`, {id: "move-layer"});

            saveNote(toStoredNote(updatedNotes[index]));
            return updatedNotes;
        });
    };

    return {
        notes,
        setNotes,
        activeNoteId,
        setActiveNoteId,
        lockDecor,
        setLockDecor,
        addNote,
        addGuideNote,
        updateNote,
        deleteNote,
        moveNoteZIndex,
        fileInputRef,
        handleImageUpload,
    };
};
