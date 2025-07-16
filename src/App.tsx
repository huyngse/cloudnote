  import { useEffect, useRef, useState } from "react";
  import { v4 as uuidv4 } from "uuid";

  type FullNote = {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    content: string;
    color: string;
    rotation?: number;
  };

  const getRandomColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;

  const localStorageKey = "cloudnote";

  const CloudNote = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [notes, setNotes] = useState<FullNote[]>(() => {
      const saved = localStorage.getItem(localStorageKey);
      return saved ? JSON.parse(saved) : [];
    });
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [lockDecor, setLockDecor] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
      x: 0,
      y: 0,
    });
    const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});

    useEffect(() => {
      localStorage.setItem(localStorageKey, JSON.stringify(notes));
    }, [notes]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawNotes(ctx);
      };

      resize();
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }, [notes]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const handleMouseDown = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const clickedNote = [...notes]
          .reverse()
          .find(
            (note) =>
              mouseX >= note.x &&
              mouseX <= note.x + note.width &&
              mouseY >= note.y &&
              mouseY <= note.y + note.height
          );

        if (clickedNote) {
          setActiveNoteId(clickedNote.id);
          setDraggingNoteId(clickedNote.id);
          setDragOffset({
            x: mouseX - clickedNote.x,
            y: mouseY - clickedNote.y,
          });
        } else {
          setActiveNoteId(null);
        }
      };

      canvas.addEventListener("mousedown", handleMouseDown);
      return () => canvas.removeEventListener("mousedown", handleMouseDown);
    }, [notes]);

    useEffect(() => {
      notes.forEach((note) => {
        if (note.content.startsWith("data:image") && !imageCacheRef.current[note.id]) {
          const img = new Image();
          img.src = note.content;
          img.onload = () => {
            imageCacheRef.current[note.id] = img;
          };
        }
      });
    }, [notes]);
    

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const handleMouseMove = (e: MouseEvent) => {
        if (!draggingNoteId) return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        updateNote(draggingNoteId, {
          x: mouseX - dragOffset.x,
          y: mouseY - dragOffset.y,
        });
      };

      const handleMouseUp = () => {
        setDraggingNoteId(null);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }, [draggingNoteId, dragOffset]);

    function addNote() {}

    function drawNotes(ctx: CanvasRenderingContext2D) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
      notes.forEach((note) => {
        ctx.save();
        ctx.translate(note.x + note.width / 2, note.y + note.height / 2);
        ctx.rotate(((note.rotation || 0) * Math.PI) / 180);
        ctx.translate(-note.width / 2, -note.height / 2);
    
        // draw background
        ctx.fillStyle = note.color;
        ctx.fillRect(0, 0, note.width, note.height);
    
        if (note.content.startsWith("data:image")) {
          const cachedImg = imageCacheRef.current[note.id];
          if (cachedImg) {
            ctx.drawImage(cachedImg, 0, 0, note.width, note.height);
          } else {
            // optional: show a loading placeholder
            ctx.fillStyle = "#aaa";
            ctx.font = "italic sixteen px sans-serif";
            ctx.fillText("loading image...", 10, 20);
          }
        } else {
          ctx.fillStyle = "#000";
          ctx.font = "sixteen px sans-serif";
          ctx.fillText(note.content, 10, 20, note.width - 20);
        }
    
        ctx.restore();
      });
    }
    
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {};

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
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
        <div className="flex justify-end bottom-0 gap-3 fixed w-full z-[1000] p-3">
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
        <canvas ref={canvasRef} className="w-full h-full absolute top-0 left-0" />
      </div>
    );
  };

  export default CloudNote;
