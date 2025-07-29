import { useEffect, useRef } from "react";
import { useDrag } from "@use-gesture/react";
import { useEditorContext } from "@/contexts/EditorContext";

export function useNoteDrag(
    id: string,
    x: number,
    y: number,
    scale: number,
    onUpdate: (id: string, updates: { x: number; y: number }) => void,
    setLocalPos: (pos: { x: number; y: number }) => void
) {
    const dragPos = useRef({ x, y });
    const { isDraggingNoteRef } = useEditorContext();

    useEffect(() => {
        dragPos.current = { x, y };
        setLocalPos({ x, y });
    }, [x, y, setLocalPos]);

    const bind = useDrag(
        ({ event, offset: [dx, dy], first, last }) => {
            event?.stopPropagation();

            const newX = dx / scale;
            const newY = dy / scale;

            dragPos.current = { x: newX, y: newY };
            setLocalPos(dragPos.current);

            if (first) isDraggingNoteRef.current = true;
            if (last) {
                onUpdate(id, dragPos.current);
                isDraggingNoteRef.current = false;
            }
        },
        {
            from: () => [dragPos.current.x * scale, dragPos.current.y * scale],
            pointer: { touch: true }, 
        }
    );

    return { bind };
}
