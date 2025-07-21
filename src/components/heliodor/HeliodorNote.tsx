import React, { useEffect, useRef, useState } from "react";
import { NoteWrapper } from "./NoteWrapper";
import { NoteControls } from "./NoteControls";
import { NoteContent } from "./NoteContent";
import { useNoteDrag } from "@/hooks/useNoteDrag";
import { useNoteResize } from "@/hooks/useNoteResize";
import { useNoteRotate } from "@/hooks/useNoteRotate";

export type HeliodorNoteProps = {
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
  scale?: number;
  onActivate?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<HeliodorNoteProps>) => void;
  onDelete?: (id: string) => void;
  onZIndexChange?: (id: string, direction: "up" | "down") => void;
};

const HeliodorNote = ({
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
  scale = 1,
  onUpdate = () => {},
  onDelete = () => {},
  onActivate = () => {},
  onZIndexChange = () => {},
}: HeliodorNoteProps) => {
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

  const { handleDragStart } = useNoteDrag(
    id,
    x,
    y,
    scale,
    onUpdate,
    setLocalPos
  );
  
  const { handleResizeStart } = useNoteResize(
    id,
    width,
    height,
    scale,
    onUpdate,
    setLocalSize
  );

  const { handleRotateStart } = useNoteRotate(
    id,
    rotation,
    onUpdate,
    setLocalRotation,
    noteRef
  );

  const handleContentChange = (value: string) => {
    onUpdate(id, { content: value });
  };

  const handleDoubleClick = () => {
    onUpdate(id, { decorMode: !decorMode });
  };

  return (
    <NoteWrapper
      noteRef={noteRef}
      position={localPos}
      rotation={localRotation.rotation}
      zIndex={zIndex}
      decorMode={decorMode}
      lockDecor={lockDecor}
    >
      <NoteControls
        isActive={isActive}
        decorMode={decorMode}
        onCopy={() => navigator.clipboard.writeText(content)}
        onRotateStart={handleRotateStart}
        onDecorate={() => onUpdate(id, { decorMode: true })}
        onDelete={() => onDelete(id)}
        onZIndexChange={(dir) => onZIndexChange(id, dir)}
        onResetRotation={() => {
          const reset = { rotation: 0 };
          rotateRef.current = reset;
          setLocalRotation(reset);
          onUpdate(id, reset);
        }}
      />

      <div
        className={`rounded overflow-hidden ${decorMode ? "" : "shadow-xl"}`}
        style={{
          width: localSize.width,
          height: localSize.height,
          backgroundColor: decorMode ? "transparent" : color,
        }}
        onMouseDown={() => !decorMode && onActivate(id)}
      >
        {!decorMode && (
          <button
            className="py-1 bg-black/20 text-sm text-black select-none cursor-grab active:cursor-grabbing font-semibold text-right px-2 w-full touch-none"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            title="drag me 🖐️"
          >
            ⋮⋮
          </button>
        )}

        <NoteContent
          content={content}
          decorMode={decorMode}
          lockDecor={lockDecor}
          onContentChange={handleContentChange}
          onDoubleClick={handleDoubleClick}
        />

        {!decorMode && (
          <div
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-black/10 touch-none"
          />
        )}
      </div>
    </NoteWrapper>
  );
};

export default React.memo(HeliodorNote);
