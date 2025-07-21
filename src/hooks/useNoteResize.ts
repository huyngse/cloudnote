import { useRef, useEffect } from "react";
import { useDrag } from "@use-gesture/react";
import { useEditorContext } from "@/contexts/EditorContext";

export function useNoteResize(
    id: string,
    width: number,
    height: number,
    scale: number,
    onUpdate: (id: string, updates: { width: number; height: number }) => void,
    setLocalSize: (size: { width: number; height: number }) => void
) {
    const resizeRef = useRef({ width, height });
    const { isResizingNoteRef } = useEditorContext();


    useEffect(() => {
        resizeRef.current = { width, height };
        setLocalSize({ width, height });
    }, [width, height, setLocalSize]);

    const bind = useDrag(({ movement: [mx, my], first, last }) => {
        if (first) {
            resizeRef.current = { width, height }; // Reset to initial size at start
            isResizingNoteRef.current = true;
        }

        const newWidth = resizeRef.current.width + mx / scale;
        const newHeight = resizeRef.current.height + my / scale;

        const clampedSize = {
            width: Math.max(1, newWidth),
            height: Math.max(1, newHeight),
        };

        setLocalSize(clampedSize);

        if (last) {
            onUpdate(id, clampedSize);
            isResizingNoteRef.current = false;
        }
    });

    return { bind };
}
