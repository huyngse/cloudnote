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
  onUpdate: (id: string, updates: Partial<NoteProps>) => void;
  onDelete: (id: string) => void;
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

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();

    const startX = "touches" in e ? e.touches[0].pageX : e.pageX;
    const startY = "touches" in e ? e.touches[0].pageY : e.pageY;
    const offsetX = startX - dragPos.current.x;
    const offsetY = startY - dragPos.current.y;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveX =
        "touches" in moveEvent ? moveEvent.touches[0].pageX : moveEvent.pageX;
      const moveY =
        "touches" in moveEvent ? moveEvent.touches[0].pageY : moveEvent.pageY;

      const newX = moveX - offsetX;
      const newY = moveY - offsetY;

      dragPos.current = { x: newX, y: newY };
      setLocalPos({ x: newX, y: newY }); // Only update local state
    };

    const onEnd = () => {
      onUpdate(id, { x: dragPos.current.x, y: dragPos.current.y }); // Commit to state
      document.removeEventListener("mousemove", onMove as any);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove as any);
      document.removeEventListener("touchend", onEnd);
    };

    document.addEventListener("mousemove", onMove as any);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove as any, { passive: false });
    document.addEventListener("touchend", onEnd);
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = "touches" in e ? e.touches[0].pageX : e.pageX;
    const startY = "touches" in e ? e.touches[0].pageY : e.pageY;
    const startWidth = width;
    const startHeight = height;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveX =
        "touches" in moveEvent ? moveEvent.touches[0].pageX : moveEvent.pageX;
      const moveY =
        "touches" in moveEvent ? moveEvent.touches[0].pageY : moveEvent.pageY;

      const newWidth = startWidth + (moveX - startX);
      const newHeight = startHeight + (moveY - startY);

      resizeRef.current = { width: newWidth, height: newHeight };
      setLocalSize({ width: newWidth, height: newHeight });
    };

    const onEnd = () => {
      onUpdate(id, {
        width: resizeRef.current.width,
        height: resizeRef.current.height,
      });
      document.removeEventListener("mousemove", onMove as any);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove as any);
      document.removeEventListener("touchend", onEnd);
    };

    document.addEventListener("mousemove", onMove as any);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove as any, { passive: false });
    document.addEventListener("touchend", onEnd);
  };

  const handleRotateStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const noteElement = noteRef.current;
    if (!noteElement) return;

    const rect = noteElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const initialDx = clientX - centerX;
    const initialDy = clientY - centerY;
    const initialAngle = Math.atan2(initialDy, initialDx) * (180 / Math.PI);
    const startRotation = rotation || 0;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveX =
        "touches" in moveEvent
          ? moveEvent.touches[0].clientX
          : moveEvent.clientX;
      const moveY =
        "touches" in moveEvent
          ? moveEvent.touches[0].clientY
          : moveEvent.clientY;

      const dx = moveX - centerX;
      const dy = moveY - centerY;
      const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);

      const angleDiff = currentAngle - initialAngle;
      const newRotation = startRotation + angleDiff;

      rotateRef.current = { rotation: newRotation };
      setLocalRotation({ rotation: newRotation });
    };

    const onEnd = () => {
      onUpdate(id, { rotation: rotateRef.current.rotation });
      document.removeEventListener("mousemove", onMove as any);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove as any);
      document.removeEventListener("touchend", onEnd);
    };

    document.addEventListener("mousemove", onMove as any);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove as any, { passive: false });
    document.addEventListener("touchend", onEnd);
  };

  const handleDoubleClick = () => {
    onUpdate(id, { decorMode: !decorMode });
  };

  return (
    <div
      ref={noteRef}
      className="absolute note"
      style={{
        top: localPos.y,
        left: localPos.x,
        transform: `rotate(${localRotation.rotation ?? 0}deg)`,
        transformOrigin: "center center",
        zIndex: zIndex ?? 1,
      }}
    >
      {isActive && !decorMode && (
        <div className="absolute -top-8 right-0 flex gap-2 z-10 select-none">
          <button
            onMouseDown={(e) => handleRotateStart(e)}
            onTouchStart={(e) => handleRotateStart(e)}
            className="bg-white shadow rounded-full p-1 text-sm hover:bg-gray-100 cursor-pointer duration-300"
            title="rotate me ♻️"
          >
            ♻️
          </button>
          <button
            onClick={() => onUpdate(id, { decorMode: true })}
            className="bg-white shadow rounded-full p-1 text-sm hover:bg-gray-100 cursor-pointer duration-300"
            title="decorate 🌿"
          >
            🌿
          </button>
          <button
            onClick={() => onDelete(id)}
            className="bg-white shadow rounded-full p-1 text-sm hover:bg-gray-100 cursor-pointer duration-300"
            title="delete ✖️"
          >
            ✖️
          </button>
        </div>
      )}
      <div
        className={` rounded overflow-hidden ${decorMode ? "" : "shadow-xl"}`}
        style={{
          width: localSize.width,
          height: localSize.height,
          backgroundColor: decorMode ? "transparent" : color,
        }}
        onMouseDown={() => {
          if (!decorMode) {
            onActivate?.(id);
          }
        }}
      >
        {decorMode ? (
          <div className="opacity-0 select-none py-1">Invisible</div>
        ) : (
          <button
            className="py-1 bg-black/20 text-sm text-black select-none cursor-grab active:cursor-grabbing font-semibold text-right px-2 w-full"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            title="Drag me 🖐️"
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

        {/* Resize handle */}
        {!decorMode && (
          <div
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-black/10"
          ></div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Note);
