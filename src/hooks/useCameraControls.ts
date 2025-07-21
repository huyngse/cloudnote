import { useEffect, useRef, useState, useCallback } from "react";
import { getCanvasCenter } from "../utils/canvasUtils";

const panZoomStorageKey = "cloudnote-pan-zoom";

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

    const panRef = useRef(pan);
    const isPanning = useRef(false);
    const startX = useRef(0);
    const startY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useState(() => {
        localStorage.setItem(panZoomStorageKey, JSON.stringify({ pan, scale }));
    });

    useEffect(() => {
        panRef.current = pan;
    }, [pan]);

    // 🖱️ panning
    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (e.shiftKey) {
                isPanning.current = true;
                setCursorMode("panning");
                startX.current = e.clientX;
                startY.current = e.clientY;
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isPanning.current) {
                const dx = e.clientX - startX.current;
                const dy = e.clientY - startY.current;
                setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
                startX.current = e.clientX;
                startY.current = e.clientY;
            }
        };

        const handleMouseUp = () => {
            isPanning.current = false;
            setCursorMode("default");
        };

        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    // 🔍 zooming
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (!e.shiftKey) return;
            e.preventDefault();
            setCursorMode("scaling");

            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const { x: panX, y: panY } = panRef.current;
            const canvasX = (centerX - panX) / scale;
            const canvasY = (centerY - panY) / scale;

            let newScale = scale - e.deltaY * 0.001;
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

        const container = containerRef.current;
        container?.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            container?.removeEventListener("wheel", handleWheel);
        };
    }, [scale]);

    useEffect(() => {
        localStorage.setItem(panZoomStorageKey, JSON.stringify({ pan, scale }));
    }, [pan, scale]);

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
