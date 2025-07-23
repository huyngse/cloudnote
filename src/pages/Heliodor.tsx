import Note from "@/components/heliodor/HeliodorNote";
import { HeliodorToolbar } from "@/components/heliodor/HeliodorToolbar";
import Toast from "@/components/Toast";
import { useCameraControls } from "@/hooks/useCameraControls";
import { useHeliodorNotes } from "@/hooks/useHeliodorNotes";
import { useClipboardHandler } from "@/hooks/useClipboardHandler";
import { useDeleteShortcut } from "@/hooks/useDeleteShortcut";
import { useToast } from "@/hooks/useToast";
import { useEffect } from "react";

const Heliodor = () => {
  const { message, showToast, clearToast } = useToast();
  const { pan, scale, cursorMode, containerRef, getCenterPosition } =
    useCameraControls();

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

  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem("heliodor_has_visited");

    if (!hasVisitedBefore) {
      addGuideNote();
      localStorage.setItem("heliodor_has_visited", "true");
    }
  }, [addGuideNote]);

  return (
    <div className="w-full h-screen relative bg-slate-100 overflow-auto">
      {message && <Toast message={message} onClose={clearToast} />}

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
          w-full h-full overflow-hidden ${
            cursorMode === "panning" ? "cursor-grabbing select-none" : ""
          } ${cursorMode === "scaling" ? "cursor-zoom-in" : ""}
        `}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest(".note")) {
            setActiveNoteId(null);
          }
        }}
        style={{
          touchAction: "none",
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
