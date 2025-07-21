import { useEffect, useRef, type RefObject } from "react";
import { useGesture } from "@use-gesture/react";
import { useEditorContext } from "@/contexts/EditorContext";

type RotateRef = {
    rotation: number;
    initialAngle?: number;
    startRotation?: number;
}

export function useNoteRotate(
    id: string,
    rotation: number,
    onUpdate: (id: string, updates: { rotation: number }) => void,
    setLocalRotation: (rotation: { rotation: number }) => void,
    noteRef: RefObject<HTMLElement | null>
) {
    const rotateRef = useRef<RotateRef>({ rotation });
    const { isRotatingNoteRef } = useEditorContext();

    // Update internal ref when external rotation changes
    useEffect(() => {
        rotateRef.current = { rotation };
        setLocalRotation({ rotation });
    }, [rotation, setLocalRotation]);

    const gestureTargetRef = useRef<HTMLButtonElement | null>(null);

    useGesture(
        {
            onDrag: ({ xy: [x, y], first, last }) => {
                const rect = noteRef.current?.getBoundingClientRect();
                if (!rect) return;

                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const angle =
                    Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);

                if (first) {
                    // Store initial rotation and angle when drag starts
                    rotateRef.current = {
                        ...rotateRef.current,
                        initialAngle: angle,
                        startRotation: rotateRef.current.rotation,
                    };
                    isRotatingNoteRef.current = true;
                }

                const angleDiff = angle - (rotateRef.current.initialAngle ?? 0);
                const newRotation = (rotateRef.current.startRotation ?? 0) + angleDiff;

                rotateRef.current.rotation = newRotation;
                setLocalRotation({ rotation: newRotation });

                if (last) {
                    onUpdate(id, { rotation: newRotation });
                    isRotatingNoteRef.current = false;
                }
            },
        },
        {
            target: gestureTargetRef,
            eventOptions: { passive: false },
            drag: {
                pointer: { buttons: [1] }, // Left click only
                filterTaps: true,
            },
        }
    );

    return {
        gestureTargetRef,
    };
}
