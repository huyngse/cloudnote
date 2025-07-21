// NoteWrapper.tsx
type NoteWrapperProps = {
  children: React.ReactNode;
  position: { x: number; y: number };
  rotation: number;
  zIndex: number;
  decorMode: boolean;
  lockDecor: boolean;
  noteRef: React.RefObject<HTMLDivElement | null>;
};

export const NoteWrapper = ({
  children,
  position,
  rotation,
  zIndex,
  decorMode,
  lockDecor,
  noteRef,
}: NoteWrapperProps) => (
  <div
    ref={noteRef}
    className={`absolute touch-none ${decorMode ? "" : "note"} ${
      lockDecor && decorMode ? "pointer-events-none" : ""
    }`}
    style={{
      top: position.y,
      left: position.x,
      transform: `rotate(${rotation}deg)`,
      transformOrigin: "center center",
      zIndex,
    }}
  >
    {children}
  </div>
);
