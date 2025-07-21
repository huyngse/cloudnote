import { useRef, useEffect, useCallback } from "react";

export function useNoteResize(
    id: string,
    width: number,
    height: number,
    scale: number,
    onUpdate: (id: string, updates: { width: number; height: number }) => void,
    setLocalSize: (size: { width: number; height: number }) => void
) {
    const resizeRef = useRef({ width, height });

    useEffect(() => {
        resizeRef.current = { width, height };
        setLocalSize({ width, height });
    }, [width, height, setLocalSize]);

    const getClientCoords = (
        e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent
    ) =>
        "touches" in e
            ? { x: e.touches[0].pageX, y: e.touches[0].pageY }
            : { x: e.pageX, y: e.pageY };

    const handleResizeStart = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const start = getClientCoords(e);
            const startWidth = resizeRef.current.width;
            const startHeight = resizeRef.current.height;

            const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
                const move = getClientCoords(moveEvent);
                const newWidth = startWidth + (move.x - start.x) / scale;
                const newHeight = startHeight + (move.y - start.y) / scale;
                resizeRef.current = { width: newWidth, height: newHeight };
                setLocalSize(resizeRef.current);
            };

            const handleEnd = () => {
                onUpdate(id, resizeRef.current);
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
        [id, scale, onUpdate, setLocalSize]
    );

    return { handleResizeStart };
}
