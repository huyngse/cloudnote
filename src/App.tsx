// App.tsx
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Note, { type NoteProps } from "./Note.tsx";

// `FullNote` is currently identical to `NoteProps`, but kept separate in case
// you want to expand internal-only fields later 🌱
type FullNote = NoteProps;

// utility: generate a soft pastel color with random hue
const getRandomColor = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;

const localStorageKey = "cloudnote";
const lockDecorStorageKey = "cloudnote-lock-decor";

const CloudNote = () => {
  // 📝 state for all notes
  const [notes, setNotes] = useState<FullNote[]>(() => {
    const saved = localStorage.getItem(localStorageKey);
    return saved ? JSON.parse(saved) : [];
  });

  // ✨ which note is currently selected
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  // 🌼 toggles decorative lock
  const [lockDecor, setLockDecor] = useState<boolean>(() => {
    const saved = localStorage.getItem(lockDecorStorageKey);
    return saved ? JSON.parse(saved) : false;
  });

  // 🧭 pan/zoom
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

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

  // persist notes to localStorage anytime they change
  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(notes));
  }, [notes]);

  // 🌸 persist lockDecor state to localStorage anytime it changes
  useEffect(() => {
    localStorage.setItem(lockDecorStorageKey, JSON.stringify(lockDecor));
  }, [lockDecor]);

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
                  const newNote: FullNote = {
                    id: uuidv4(),
                    x: 100 + Math.random() * 300,
                    y: 100 + Math.random() * 300,
                    width: 250,
                    height: 250,
                    content: reader.result as string,
                    color: getRandomColor(),
                  };
                  setNotes((prev) => [...prev, newNote]);
                };
                reader.readAsDataURL(blob);
                return;
              } else if (type === "text/plain") {
                const text = await blob.text();
                if (text.trim()) {
                  const newNote: FullNote = {
                    id: uuidv4(),
                    x: 100 + Math.random() * 300,
                    y: 100 + Math.random() * 300,
                    width: 200,
                    height: 150,
                    content: text,
                    color: getRandomColor(),
                  };
                  setNotes((prev) => [...prev, newNote]);
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
  }, []);

  // 🖱️ panning logic using shift + mouse drag
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.shiftKey) {
        isPanning.current = true;
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

      let newScale = scale - e.deltaY * 0.001;
      newScale = Math.min(Math.max(newScale, 0.5), 2);

      setScale(newScale);
    };

    const container = containerRef.current;
    container?.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container?.removeEventListener("wheel", handleWheel);
    };
  }, [scale]);

  // ➕ add new blank note
  const addNote = () => {
    const newNote: FullNote = {
      id: uuidv4(),
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      content: "Type something...",
      color: getRandomColor(),
      rotation: 0,
      onUpdate: () => {},
      onDelete: () => {},
    };
    setNotes([...notes, newNote]);
  };

  // 🌄 handle user-uploaded image note
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const newNote: FullNote = {
          id: uuidv4(),
          x: 100 + Math.random() * 300,
          y: 100 + Math.random() * 300,
          width: 250,
          height: 250,
          content: reader.result as string,
          color: getRandomColor(),
          onUpdate: () => {},
          onDelete: () => {},
        };
        setNotes((prev) => [...prev, newNote]);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✏️ update a specific note by id
  const updateNote = (id: string, updates: Partial<FullNote>) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, ...updates } : note))
    );
  };

  // ❌ delete a note by id
  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  return (
    <div className="w-full h-screen relative bg-slate-100 overflow-auto">
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
      </div>

      {/* 🌤️ main canvas area */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden"
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest(".note")) {
            setActiveNoteId(null);
          }
        }}
      >
        <div
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
              zIndex={note.id === activeNoteId ? 999 : 1}
              isActive={note.id === activeNoteId}
              onActivate={setActiveNoteId}
              lockDecor={lockDecor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CloudNote;
