import Note from "@/components/Note";
import { useCameraControls } from "@/hooks/useCameraControls";
import { useNotes } from "@/hooks/useNotes";
import { useClipboardHandler } from "@/hooks/useClipboardHandler";
import { useDeleteShortcut } from "@/hooks/useDeleteShortcut";
import { useEffect } from "react";
import Toolbar from "@/components/Toolbar";
import { useSettings } from "@/contexts/SettingsContext";

const Heliodor = () => {
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
  } = useNotes(getCenterPosition);

  const { settings } = useSettings();

  useClipboardHandler(setNotes, getCenterPosition);
  useDeleteShortcut(activeNoteId, deleteNote, () => setActiveNoteId(null));

  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem("has_visited");

    if (!hasVisitedBefore) {
      addGuideNote();
      localStorage.setItem("has_visited", "true");
    }
  }, [addGuideNote]);

  return (
    <div
      className="w-full h-screen relative overflow-auto"
      style={{ backgroundColor: settings.bgColor }}
    >
      {/* ☁️ toolbar */}
      <Toolbar
        addNote={addNote}
        fileInputRef={fileInputRef}
        handleImageUpload={handleImageUpload}
        lockDecor={lockDecor}
        setLockDecor={setLockDecor}
        addGuideNote={addGuideNote}
      />

      {/* 🌤️ canvas area */}
      <main
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
      </main>
    </div>
  );
};

export default Heliodor;
