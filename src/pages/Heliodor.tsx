import { useState } from "react";
import Note from "@/components/heliodor/HeliodorNote";
import { HeliodorToolbar } from "@/components/heliodor/HeliodorToolbar";
import Toast from "@/components/Toast";
import { useCameraControls } from "@/hooks/useCameraControls";
import { useHeliodorNotes } from "@/hooks/useHeliodorNotes";
import { useClipboardHandler } from "@/hooks/useClipboardHandler";
import { useDeleteShortcut } from "@/hooks/useDeleteShortcut";

const Heliodor = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { pan, scale, cursorMode, containerRef, getCenterPosition } =
    useCameraControls();

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const {
    notes,
    setNotes,
    activeNoteId,
    setActiveNoteId,
    lockDecor,
    setLockDecor,
    addNote,
    addGuideNote,
    updateNote,
    deleteNote,
    moveNoteZIndex,
    fileInputRef,
    handleImageUpload,
  } = useHeliodorNotes(getCenterPosition, showToast);

  useClipboardHandler(setNotes, getCenterPosition);
  useDeleteShortcut(activeNoteId, deleteNote, () => setActiveNoteId(null));

  return (
    <div className="w-full h-screen relative bg-slate-100 overflow-auto">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* ☁️ toolbar */}
      <HeliodorToolbar
        addNote={addNote}
        fileInputRef={fileInputRef}
        handleImageUpload={handleImageUpload}
        lockDecor={lockDecor}
        setLockDecor={setLockDecor}
        addGuideNote={addGuideNote}
      />

      {/* 🌤️ canvas area */}
      <div
        ref={containerRef}
        className={`
          w-full h-full overflow-hidden
          ${cursorMode === "panning" ? "cursor-grabbing select-none" : ""}
          ${cursorMode === "scaling" ? "cursor-zoom-in" : ""}
        `}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest(".note")) {
            setActiveNoteId(null);
          }
        }}
      >
        <div
          className="duration-100"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "top left",
            width: `${window.innerWidth / scale}px`,
            height: `${window.innerHeight / scale}px`,
            position: "relative",
          }}
        >
          {notes.map((note) => (
            <Note
              key={note.id}
              {...note}
              onUpdate={updateNote}
              onDelete={deleteNote}
              zIndex={note.id === activeNoteId ? 999 : note.zIndex ?? 1}
              isActive={note.id === activeNoteId}
              onActivate={setActiveNoteId}
              lockDecor={lockDecor}
              onZIndexChange={moveNoteZIndex}
              scale={scale}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Heliodor;