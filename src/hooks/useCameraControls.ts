import { useState, useRef, useEffect, useCallback } from "react";
import { useGesture } from "@use-gesture/react";
import { getCanvasCenter } from "../utils/canvasUtils";
import { useEditorContext } from "@/contexts/EditorContext";
import { panZoomStorageKey } from "@/constants/storageKeys";

export const useCameraControls = () => {
    const [pan, setPan] = useState<{ x: number; y: number }>(() => {
        const stored = localStorage.getItem(panZoomStorageKey);
        if (stored) {
            try {
                return JSON.parse(stored).pan ?? { x: 0, y: 0 };
            } catch {
                return { x: 0, y: 0 };
            }
        }
        return { x: 0, y: 0 };
    });

    const [scale, setScale] = useState(() => {
        const stored = localStorage.getItem(panZoomStorageKey);
        if (stored) {
            try {
                return JSON.parse(stored).scale ?? 1;
            } catch {
                return 1;
            }
        }
        return 1;
    });

    const [cursorMode, setCursorMode] = useState<"default" | "panning" | "scaling">("default");

    const { isDraggingNoteRef, isRotatingNoteRef, isResizingNoteRef } = useEditorContext();

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            const isScrollingCanvas = (e.target as HTMLElement).closest(".note") === null;
            if (!isScrollingCanvas) return;
            e.preventDefault();
            setCursorMode("scaling");

            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const currentPan = panRef.current;
            const currentScale = scaleRef.current;

            const canvasX = (centerX - currentPan.x) / currentScale;
            const canvasY = (centerY - currentPan.y) / currentScale;

            let newScale = currentScale - e.deltaY * 0.001;
            newScale = Math.min(Math.max(newScale, 0.5), 2);

            const newPanX = centerX - canvasX * newScale;
            const newPanY = centerY - canvasY * newScale;

            setScale(newScale);
            setPan({ x: newPanX, y: newPanY });

            clearTimeout((handleWheel as any)._timeout);
            (handleWheel as any)._timeout = setTimeout(() => {
                setCursorMode("default");
            }, 300);
        };

        container.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            container.removeEventListener("wheel", handleWheel);
        };
    }, []);

    const scaleRef = useRef(scale);
    const panRef = useRef(pan);

    // Keep refs in sync
    useEffect(() => { scaleRef.current = scale }, [scale]);
    useEffect(() => { panRef.current = pan }, [pan]);

    // 💾 Save to localStorage
    useEffect(() => {
        localStorage.setItem(panZoomStorageKey, JSON.stringify({ pan, scale }));
    }, [pan, scale]);

    // 🎯 Gesture bindings (mobile + desktop!)
    useGesture(
        {
            onDrag: ({ delta: [dx, dy], pinching, event }) => {
                const isDraggingCanvas = (event.target as HTMLElement).closest(".note") === null;
                if (
                    !isDraggingCanvas ||
                    isDraggingNoteRef.current ||
                    isRotatingNoteRef.current ||
                    isResizingNoteRef.current ||
                    pinching
                ) return;

                setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
                setCursorMode("panning");
            },
            onPinch: ({ origin: [ox, oy], da: [_], offset: [scaleVal] }) => {
                const container = containerRef.current;
                if (!container) return;

                const rect = container.getBoundingClientRect();
                const offsetX = ox - rect.left;
                const offsetY = oy - rect.top;

                const initialScale = scaleRef.current;
                const initialPan = panRef.current;

                const canvasX = (offsetX - initialPan.x) / initialScale;
                const canvasY = (offsetY - initialPan.y) / initialScale;

                let newScale = scaleVal;
                newScale = Math.min(Math.max(newScale, 0.5), 2);

                const newPanX = offsetX - canvasX * newScale;
                const newPanY = offsetY - canvasY * newScale;

                setScale(newScale);
                setPan({ x: newPanX, y: newPanY });

                setCursorMode("scaling");
            },
            onPinchEnd: () => setCursorMode("default"),
            onDragEnd: () => setCursorMode("default"),
        },
        {
            target: containerRef,
            eventOptions: { passive: false },
            pinch: { scaleBounds: { min: 0.5, max: 2 }, rubberband: true },
            drag: { pointer: { touch: true }, filterTaps: true },
        }
    );

    const getCenterPosition = useCallback(() => {
        const container = containerRef.current;
        if (!container) return null;
        const { x: centerX, y: centerY } = getCanvasCenter(container, pan, scale);
        const offsetX = (Math.random() - 1) * 40;
        const offsetY = (Math.random() - 1) * 40;
        return {
            x: centerX + offsetX,
            y: centerY + offsetY,
        };
    }, [pan, scale]);

    return {
        pan,
        setPan,
        scale,
        setScale,
        cursorMode,
        containerRef,
        getCenterPosition,
        setCursorMode,
    };
};
