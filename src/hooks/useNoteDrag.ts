import { useRef, useEffect, useCallback } from "react";

export function useNoteDrag(
    id: string,
    x: number,
    y: number,
    scale: number,
    onUpdate: (id: string, updates: { x: number; y: number }) => void,
    setLocalPos: (pos: { x: number; y: number }) => void
) {
    const dragPos = useRef({ x, y });

    useEffect(() => {
        dragPos.current = { x, y };
        setLocalPos({ x, y });
    }, [x, y, setLocalPos]);

    const getClientCoords = (
        e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent
    ) =>
        "touches" in e
            ? { x: e.touches[0].pageX, y: e.touches[0].pageY }
            : { x: e.pageX, y: e.pageY };

    const handleDragStart = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            e.preventDefault();
            const start = getClientCoords(e);
            const offsetX = start.x - dragPos.current.x * scale;
            const offsetY = start.y - dragPos.current.y * scale;

            const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
                const move = getClientCoords(moveEvent);
                const newX = (move.x - offsetX) / scale;
                const newY = (move.y - offsetY) / scale;
                dragPos.current = { x: newX, y: newY };
                setLocalPos(dragPos.current);
            };

            const handleEnd = () => {
                onUpdate(id, dragPos.current);
                cleanup();
            };

            const cleanup = () => {
                document.removeEventListener("mousemove", handleMove as any);
                document.removeEventListener("mouseup", handleEnd);
                document.removeEventListener("touchmove", handleMove as any);
                document.removeEventListener("touchend", handleEnd);
            };

            document.addEventListener("mousemove", handleMove as any);
            document.addEventListener("mouseup", handleEnd);
            document.addEventListener("touchmove", handleMove as any, {
                passive: false,
            });
            document.addEventListener("touchend", handleEnd);
        },
        [id, scale, onUpdate, setLocalPos]
    );

    return { handleDragStart };
}
