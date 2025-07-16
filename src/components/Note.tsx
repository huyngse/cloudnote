// components/Note.tsx
import React, { useEffect, useRef, useState } from "react";

export type NoteProps = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  zIndex?: number;
  rotation?: number;
  decorMode?: boolean;
  isActive?: boolean;
  lockDecor?: boolean;
  onActivate?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<NoteProps>) => void;
  onDelete?: (id: string) => void;
  onZIndexChange?: (id: string, direction: "up" | "down") => void;
};

const Note = ({
  id,
  x = 100,
  y = 100,
  width = 200,
  height = 150,
  content = "",
  color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`,
  zIndex = 1,
  rotation = 0,
  decorMode = false,
  isActive = false,
  lockDecor = false,
  onUpdate = () => {},
  onDelete = () => {},
  onActivate = () => {},
  onZIndexChange = () => {},
}: NoteProps) => {
  const noteRef = useRef<HTMLDivElement>(null);
  const dragPos = useRef({ x, y });
  const resizeRef = useRef({ width, height });
  const rotateRef = useRef({ rotation });

  const [localPos, setLocalPos] = useState({ x, y });
  const [localSize, setLocalSize] = useState({ width, height });
  const [localRotation, setLocalRotation] = useState({ rotation });

  useEffect(() => {
    dragPos.current = { x, y };
    setLocalPos({ x, y });
  }, [x, y]);

  useEffect(() => {
    resizeRef.current = { width, height };
    setLocalSize({ width, height });
  }, [width, height]);

  useEffect(() => {
    rotateRef.current = { rotation };
    setLocalRotation({ rotation });
  }, [rotation]);

  const getClientCoords = (
    e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent
  ) => {
    if ("touches" in e) {
      return { x: e.touches[0].pageX, y: e.touches[0].pageY };
    }
    return { x: e.pageX, y: e.pageY };
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const start = getClientCoords(e);
    const offsetX = start.x - dragPos.current.x;
    const offsetY = start.y - dragPos.current.y;

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const move = getClientCoords(moveEvent);
      const newX = move.x - offsetX;
      const newY = move.y - offsetY;
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
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const start = getClientCoords(e);
    const { width: startWidth, height: startHeight } = localSize;

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const move = getClientCoords(moveEvent);
      const newWidth = startWidth + (move.x - start.x);
      const newHeight = startHeight + (move.y - start.y);
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
  };

  const handleRotateStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = noteRef.current?.getBoundingClientRect();
    if (!rect) return;

    const { clientX, clientY } = "touches" in e ? e.touches[0] : e;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const initialAngle =
      Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    const startRotation = localRotation.rotation;

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
  };

  const handleDoubleClick = () => {
    onUpdate(id, { decorMode: !decorMode });
  };

  return (
    <div
      ref={noteRef}
      className={`absolute touch-none ${decorMode ? "" : "note"}`}
      style={{
        top: localPos.y,
        left: localPos.x,
        transform: `rotate(${localRotation.rotation}deg)`,
        transformOrigin: "center center",
        zIndex,
      }}
    >
      {isActive && !decorMode && (
        <div className="absolute -top-8 right-0 flex gap-2 z-10 select-none">
          <NoteControl
            onClick={() => navigator.clipboard.writeText(content)}
            title="📋 copy to clipboard"
          >
            📋
          </NoteControl>
          <NoteControl
            title="rotate me ♻️"
            onMouseDown={handleRotateStart}
            onDoubleClick={() => {
              const resetRotation = { rotation: 0 };
              rotateRef.current = resetRotation;
              setLocalRotation(resetRotation);
              onUpdate(id, resetRotation);
            }}
          >
            ♻️
          </NoteControl>
          <NoteControl
            title="decorate 🌿"
            onClick={() => onUpdate(id, { decorMode: true })}
          >
            🌿
          </NoteControl>
          <NoteControl title="delete ✖️" onClick={() => onDelete(id)}>
            ✖️
          </NoteControl>
        </div>
      )}
      {isActive && !decorMode && (
        <div className="absolute top-0 -right-8 flex flex-col gap-2 z-10 select-none">
          <NoteControl
            onClick={() => onZIndexChange?.(id, "up")}
            title="⬆️ move up"
          >
            ⬆️
          </NoteControl>
          <NoteControl
            onClick={() => onZIndexChange?.(id, "down")}
            title="⬇️ move down"
          >
            ⬇️
          </NoteControl>
        </div>
      )}

      <div
        className={`rounded overflow-hidden ${decorMode ? "" : "shadow-xl"}`}
        style={{
          width: localSize.width,
          height: localSize.height,
          backgroundColor: decorMode ? "transparent" : color,
        }}
        onMouseDown={() => !decorMode && onActivate?.(id)}
      >
        {decorMode ? (
          <div className="opacity-0 select-none py-1">Invisible</div>
        ) : (
          <button
            className="py-1 bg-black/20 text-sm text-black select-none cursor-grab active:cursor-grabbing font-semibold text-right px-2 w-full touch-none"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            title="drag me 🖐️"
          >
            ⋮⋮
          </button>
        )}

        {content.startsWith("data:image") ? (
          <img
            src={content}
            alt="clipboard"
            className="w-full h-[calc(100%-2rem)] object-contain"
            onDoubleClick={
              decorMode && !lockDecor ? handleDoubleClick : undefined
            }
          />
        ) : (
          <textarea
            readOnly={decorMode}
            tabIndex={decorMode ? -1 : 0}
            className="w-full h-[calc(100%-2rem)] resize-none bg-transparent focus:outline-none p-2"
            value={content}
            onChange={(e) => onUpdate(id, { content: e.target.value })}
            onDoubleClick={
              decorMode && !lockDecor ? handleDoubleClick : undefined
            }
          />
        )}

        {!decorMode && (
          <div
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-black/10 touch-none"
          />
        )}
      </div>
    </div>
  );
};

const NoteControl = ({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className="bg-white shadow rounded-full p-1 text-sm hover:bg-gray-100 cursor-pointer duration-300 touch-none"
  >
    {children}
  </button>
);

export default React.memo(Note);
