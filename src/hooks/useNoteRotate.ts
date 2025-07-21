import { useRef, useEffect, useCallback } from "react";

export function useNoteRotate(
    id: string,
    rotation: number,
    onUpdate: (id: string, updates: { rotation: number }) => void,
    setLocalRotation: (rotation: { rotation: number }) => void,
    noteRef: React.RefObject<HTMLElement | null>
) {
    const rotateRef = useRef({ rotation });

    useEffect(() => {
        rotateRef.current = { rotation };
        setLocalRotation({ rotation });
    }, [rotation, setLocalRotation]);

    const handleRotateStart = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const rect = noteRef.current?.getBoundingClientRect();
            if (!rect) return;

            const { clientX, clientY } = "touches" in e ? e.touches[0] : e;
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const initialAngle =
                Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
            const startRotation = rotateRef.current.rotation;

            const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
                const { clientX: moveX, clientY: moveY } =
                    "touches" in moveEvent ? moveEvent.touches[0] : moveEvent;
                const currentAngle =
                    Math.atan2(moveY - centerY, moveX - centerX) * (180 / Math.PI);
                const angleDiff = currentAngle - initialAngle;
                const newRotation = startRotation + angleDiff;

                rotateRef.current = { rotation: newRotation };
                setLocalRotation(rotateRef.current);
            };

            const handleEnd = () => {
                onUpdate(id, rotateRef.current);
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
        [id, noteRef, onUpdate, setLocalRotation]
    );

    return { handleRotateStart };
}
