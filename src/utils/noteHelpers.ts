// utils/noteHelpers.ts
import { v4 as uuidv4 } from "uuid";
import type { HeliodorNoteProps } from "../components/Note";
import type { StoredNote } from "./indexedDbUtils";

export const toStoredNote = (note: HeliodorNoteProps): StoredNote => {
    const { id, content, x, y, width, height, color, rotation, zIndex, decorMode } = note;
    return { id, content, x, y, width, height, color, rotation, zIndex, decorMode };
};

export const getRandomColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;

export const createNote = (
    getCenterPosition: () => { x: number; y: number } | null,
    partial: Partial<HeliodorNoteProps>
): HeliodorNoteProps => {
    const pos = getCenterPosition();
    return {
        x: pos?.x ?? 0,
        y: pos?.y ?? 0,
        id: uuidv4(),
        width: partial.width ?? 200,
        height: partial.height ?? 150,
        content: partial.content ?? "type something...",
        color: partial.color ?? getRandomColor(),
        rotation: partial.rotation ?? 0,
        zIndex: partial.zIndex ?? 1,
        onUpdate: () => { },
        onDelete: () => { },
        ...partial,
    };
};
