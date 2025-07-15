import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Note, { type NoteProps } from "./Note.tsx";

type FullNote = NoteProps;

const getRandomColor = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;

const localStorageKey = "cloudnote";

const CloudNote = () => {
  const [notes, setNotes] = useState<FullNote[]>(() => {
    const saved = localStorage.getItem(localStorageKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [lockDecor, setLockDecor] = useState(false);

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    const handlePasteShortcut = async (e: KeyboardEvent) => {
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
                    onUpdate: () => {},
                    onDelete: () => {},
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
                    onUpdate: () => {},
                    onDelete: () => {},
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

  const updateNote = (id: string, updates: Partial<FullNote>) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, ...updates } : note))
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  return (
    <div className="w-full h-screen relative bg-slate-100 overflow-auto">
      <div className="flex justify-end bottom-0 gap-3 fixed w-full z-[1000] p-3">
        <button
          onClick={addNote}
          className="bg-white shadow rounded-full p-2 text-sm hover:bg-gray-100 cursor-pointer duration-300"
          title="➕ Add Note"
        >
          ➕
        </button>
        <button
          onClick={() => setLockDecor((prev) => !prev)}
          className="bg-white shadow rounded-full p-2 text-sm hover:bg-gray-100 cursor-pointer duration-300"
          title={lockDecor ? "Unlock Decor 🔓" : "Lock Decor 🔒"}
        >
          {lockDecor ? "🔒" : "🔓"}
        </button>
      </div>
      <div
        style={{
          width: Math.max(
            ...notes.map((n) => n.x + n.width),
            window.innerWidth
          ),
          height: Math.max(
            ...notes.map((n) => n.y + n.height),
            window.innerHeight
          ),
          position: "relative",
        }}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest(".note")) {
            setActiveNoteId(null);
          }
        }}
      >
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
  );
};

export default CloudNote;
