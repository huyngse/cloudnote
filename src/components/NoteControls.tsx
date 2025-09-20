import { forwardRef, type ButtonHTMLAttributes, type RefObject } from "react";

type NoteControlsProps = {
  isActive: boolean;
  decorMode: boolean;
  rotateRef: RefObject<HTMLButtonElement | null>;
  onDelete: () => void;
  onCopy: () => void;
  onZIndexChange: (direction: "up" | "down") => void;
  onDecorate: () => void;
  onResetRotation: () => void;
};

export const NoteControls = ({
  isActive,
  decorMode,
  rotateRef,
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
          ref={rotateRef}
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

const NoteControl = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => (
  <button
    {...props}
    ref={ref}
    className="bg-white shadow rounded-full p-1 text-sm hover:bg-gray-100 cursor-pointer duration-300 touch-none"
  >
    {children}
  </button>
));
