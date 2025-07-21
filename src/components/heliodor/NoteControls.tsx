type NoteControlsProps = {
  isActive: boolean;
  decorMode: boolean;
  onRotateStart: (e: React.MouseEvent | React.TouchEvent) => void;
  onDelete: () => void;
  onCopy: () => void;
  onZIndexChange: (direction: "up" | "down") => void;
  onDecorate: () => void;
  onResetRotation: () => void;
};

export const NoteControls = ({
  isActive,
  decorMode,
  onRotateStart,
  onDelete,
  onCopy,
  onZIndexChange,
  onDecorate,
  onResetRotation,
}: NoteControlsProps) =>
  isActive && !decorMode ? (
    <>
      <div className="absolute -top-8 right-0 flex gap-2 z-10 select-none">
        <NoteControl onClick={onCopy} title="📋 copy to clipboard">
          📋
        </NoteControl>
        <NoteControl
          onMouseDown={onRotateStart}
          onDoubleClick={onResetRotation}
          title="rotate me ♻️"
        >
          ♻️
        </NoteControl>
        <NoteControl onClick={onDecorate} title="decorate 🌿">
          🌿
        </NoteControl>
        <NoteControl onClick={onDelete} title="delete ✖️">
          ✖️
        </NoteControl>
      </div>
      <div className="absolute top-0 -right-8 flex flex-col gap-2 z-10 select-none">
        <NoteControl onClick={() => onZIndexChange("up")} title="⬆️ move up">
          ⬆️
        </NoteControl>
        <NoteControl
          onClick={() => onZIndexChange("down")}
          title="⬇️ move down"
        >
          ⬇️
        </NoteControl>
      </div>
    </>
  ) : null;

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
