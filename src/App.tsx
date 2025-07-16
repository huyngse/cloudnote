// App.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Note, { type NoteProps } from "./components/Note.tsx";
import {
  deleteNoteById,
  getAllNotes,
  saveNote,
  type StoredNote,
} from "./utils/indexedDbUtils.ts";
import Toast from "./components/Toast.tsx";
import { getCanvasCenter } from "./utils/canvasUtils.ts";

type FullNote = NoteProps;

function toStoredNote(note: FullNote): StoredNote {
  const {
    id,
    content,
    x,
    y,
    width,
    height,
    color,
    rotation,
    zIndex,
    decorMode,
  } = note;
  return {
    id,
    content,
    x,
    y,
    width,
    height,
    color,
    rotation,
    zIndex,
    decorMode,
  };
}

// utility: generate a soft pastel color with random hue
const getRandomColor = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;

const lockDecorStorageKey = "cloudnote-lock-decor";
const panZoomStorageKey = "cloudnote-pan-zoom";

const autoSaveNotes = async (notes: StoredNote[]) => {
  try {
    for (const note of notes) {
      await saveNote(note);
    }
    console.log("auto-saved notes 🌿");
  } catch (error) {
    console.error("failed to auto-save notes (・・;)", error);
  }
};

const CloudNote = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  // 📝 state for all notes
  const [notes, setNotes] = useState<FullNote[]>([]);

  // ✨ which note is currently selected
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  // give the cursor a visual cue during panning and scaling
  const [cursorMode, setCursorMode] = useState<
    "default" | "panning" | "scaling"
  >("default");

  // 🌼 toggles decorative lock
  const [lockDecor, setLockDecor] = useState<boolean>(() => {
    const saved = localStorage.getItem(lockDecorStorageKey);
    return saved ? JSON.parse(saved) : false;
  });

  // 🧭 pan/zoom
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

  // 🧵 refs for panning logic (for smoother dragging!)
  const panRef = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

  // 🌈 for scaling (zooming) and tracking canvas
  const containerRef = useRef<HTMLDivElement>(null);

  // 📂 file input for image note uploads
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // sync pan state to ref for consistency during drags
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  const getCenterPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { x: centerX, y: centerY } = getCanvasCenter(container, pan, scale);

    const offsetX = (Math.random() - 1) * 40;
    const offsetY = (Math.random() - 1) * 40;
    return {
      x: centerX + offsetX,
      y: centerY + offsetY,
    };
  }, [pan, scale]);

  // fetch from indexeddb
  useEffect(() => {
    getAllNotes().then(setNotes).catch(console.error);
  }, []);

  // auto save every 5 minutes ⏳
  useEffect(() => {
    const interval = setInterval(() => {
      autoSaveNotes(notes);
    }, 1000 * 60 * 5);

    return () => clearInterval(interval);
  }, [notes]);

  // 🌸 persist lockDecor state to localStorage anytime it changes
  useEffect(() => {
    localStorage.setItem(lockDecorStorageKey, JSON.stringify(lockDecor));
  }, [lockDecor]);

  // 🌸 persist pan and zoom state to localStorage anytime it changes
  useEffect(() => {
    localStorage.setItem(panZoomStorageKey, JSON.stringify({ pan, scale }));
  }, [pan, scale]);

  // shared createNote helper
  const createNote = (partial: Partial<FullNote>): FullNote => {
    const pos = getCenterPosition();
    const newNote: FullNote = {
      x: pos?.x ?? 0,
      y: pos?.y ?? 0,
      id: uuidv4(),
      width: partial.width ?? 200,
      height: partial.height ?? 150,
      content: partial.content ?? "type something...",
      color: partial.color ?? getRandomColor(),
      rotation: partial.rotation ?? 0,
      zIndex: partial.zIndex ?? 1,
      onUpdate: () => {},
      onDelete: () => {},
      ...partial, // override defaults if provided
    };
    return newNote;
  };

  // 🌟 handle paste from clipboard (text or image)
  useEffect(() => {
    const handlePasteShortcut = async (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isEditing =
        active?.tagName === "TEXTAREA" ||
        active?.tagName === "INPUT" ||
        (active as HTMLElement)?.isContentEditable;

      if (isEditing) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        try {
          const clipboardItems = await navigator.clipboard.read();

          for (const item of clipboardItems) {
            for (const type of item.types) {
              const blob = await item.getType(type);

              if (type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = () => {
                  const newNote = createNote({
                    content: reader.result as string,
                  });
                  setNotes((prev) => [...prev, newNote]);
                  saveNote(toStoredNote(newNote));
                };
                reader.readAsDataURL(blob);
                return;
              } else if (type === "text/plain") {
                const text = await blob.text();
                if (text.trim()) {
                  const newNote = createNote({ content: text });
                  setNotes((prev) => [...prev, newNote]);
                  saveNote(toStoredNote(newNote));
                  return;
                }
              }
            }
          }
        } catch (err) {
          console.error("Clipboard access failed:", err);
        }
      }
    };

    window.addEventListener("keydown", handlePasteShortcut);
    return () => window.removeEventListener("keydown", handlePasteShortcut);
  }, [createNote]);

  // 🌟 handle delete active note
  useEffect(() => {
    const handleDeleteKey = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isEditing =
        active?.tagName === "TEXTAREA" ||
        active?.tagName === "INPUT" ||
        (active as HTMLElement)?.isContentEditable;
  
      if (isEditing) return; // don’t delete while typing, that would be spooky (⊙﹏⊙)
  
      if (activeNoteId && (e.key === "Backspace" || e.key === "Delete")) {
        e.preventDefault(); // avoid browser weirdness
        deleteNote(activeNoteId);
        setActiveNoteId(null); // clear selection after delete!
      }
    };
  
    window.addEventListener("keydown", handleDeleteKey);
    return () => window.removeEventListener("keydown", handleDeleteKey);
  }, [activeNoteId]);

  // 🖱️ panning logic using shift + mouse drag
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

        setPan((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));

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

  // 🔍 zoom in/out using shift + scroll wheel
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
    return () => container?.removeEventListener("wheel", handleWheel);
  }, [scale]);

  // ➕ add new blank note
  const addNote = () => {
    const newNote = createNote({});
    setNotes((prev) => [...prev, newNote]);
    saveNote(toStoredNote(newNote));
  };

  // 🌄 handle user-uploaded image note
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const newNote = createNote({
          content: reader.result as string,
        });
        setNotes((prev) => [...prev, newNote]);
        saveNote(toStoredNote(newNote));
      };
      reader.readAsDataURL(file);
    }
  };

  const addGuideNote = () => {
    const guideContent = `
    🌤️ welcome to cloudnote!
    
    here's how to use this magical little space:
    • shift + drag: move around the canvas 🖱️
    • shift + scroll: zoom in & out 🔍
    • ctrl/cmd + v: paste text or images from clipboard 📋
    • double-click a note: toggle decor mode 🌸
    • drag & resize notes, rotate them with the top handle 🔄
    
    have fun and stay cozy ☁️💛
    `.trim();

    const newNote = createNote({
      width: 500,
      height: 300,
      content: guideContent,
      rotation: 0,
    });

    setNotes((prev) => [...prev, newNote]);
    saveNote(toStoredNote(newNote));
  };

  // ✏️ update a specific note by id
  const updateNote = (id: string, updates: Partial<FullNote>) => {
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id === id) {
          const updated = { ...note, ...updates };
          saveNote(toStoredNote(updated));
          return updated;
        }
        return note;
      })
    );
  };

  // 🌬️ move notes forward or back
  const moveNoteZIndex = (id: string, direction: "up" | "down") => {
    setNotes((prevNotes) => {
      const targetNote = prevNotes.find((n) => n.id === id);
      if (!targetNote) return prevNotes;

      const updatedNotes = [...prevNotes];

      const currentZ = targetNote.zIndex ?? 1;
      const delta = direction === "up" ? 1 : -1;
      const newZ = Math.max(0, currentZ + delta);

      const index = updatedNotes.findIndex((n) => n.id === id);
      updatedNotes[index] = { ...targetNote, zIndex: newZ };
      showToast(`☁️ moved to layer ${newZ}`);

      saveNote(toStoredNote(updatedNotes[index]));
      return updatedNotes;
    });
  };

  // ❌ delete a note by id
  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    deleteNoteById(id);
  };

  return (
    <div className="w-full h-screen relative bg-slate-100 overflow-auto">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
      {/* ☁️ toolbar: add note, add image, toggle decor */}
      <div className="flex justify-end bottom-0 gap-3 fixed w-full z-[1000] p-3">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
        <button
          onClick={addNote}
          className="bg-white shadow rounded-full p-2 text-sm hover:bg-gray-100 cursor-pointer duration-300"
          title="➕ Add Note"
        >
          ➕
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-white shadow rounded-full p-2 text-sm hover:bg-gray-100 cursor-pointer duration-300"
          title="🖼️ Add Image Note"
        >
          🖼️
        </button>
        <button
          onClick={() => setLockDecor((prev) => !prev)}
          className="bg-white shadow rounded-full p-2 text-sm hover:bg-gray-100 cursor-pointer duration-300"
          title={lockDecor ? "Unlock Decor 🔓" : "Lock Decor 🔒"}
        >
          {lockDecor ? "🔒" : "🔓"}
        </button>
        <button
          onClick={addGuideNote}
          className="bg-white shadow rounded-full p-2 text-sm hover:bg-gray-100 cursor-pointer duration-300"
          title="❓ how to use"
        >
          ❓
        </button>
      </div>

      {/* 🌤️ main canvas area */}
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
          {/* 🌸 render all notes */}
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

export default CloudNote;
