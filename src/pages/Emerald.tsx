//Emerald.tsx
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import EmeraldNav from "../components/emerald/EmeraldNav";
import EmeraldNote, {
  type EmeraldNoteProps,
} from "../components/emerald/EmeraldNote";
import { wrapText } from "../utils/canvasUtils";

export type NoteDraw = {
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};
type EmeraldNoteData = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  zIndex: number;
  rotation: number;
  decorMode: boolean;
  isActive: boolean;
  lockDecor: boolean;
  scale: number;
};

const Emerald = () => {
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState<NoteDraw[]>([]);
  const [emeraldNotes, setEmeraldNotes] = useState<EmeraldNoteData[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteCounter, setNoteCounter] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle applying note from EmeraldNote to canvas
  const handleApplyNote = (note: NoteDraw) => {
    setNotes((prev) => [...prev, note]);
  };

  // Create new EmeraldNote
  const createEmeraldNote = () => {
    const newNote: EmeraldNoteData = {
      id: `emerald-${Date.now()}-${noteCounter}`,
      x: 100 + noteCounter * 20,
      y: 100 + noteCounter * 20,
      width: 200,
      height: 150,
      content: "",
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%, 0.2)`,
      zIndex: noteCounter + 1,
      rotation: 0,
      decorMode: false,
      isActive: false,
      lockDecor: false,
      scale: 1,
    };

    setEmeraldNotes((prev) => [...prev, newNote]);
    setNoteCounter((prev) => prev + 1);
    setActiveNoteId(newNote.id);
  };

  // Update EmeraldNote
  const updateEmeraldNote = (
    id: string,
    updates: Partial<EmeraldNoteProps>
  ) => {
    setEmeraldNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, ...updates } : note))
    );
  };

  // Delete EmeraldNote
  const deleteEmeraldNote = (id: string) => {
    setEmeraldNotes((prev) => prev.filter((note) => note.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  };

  // Activate EmeraldNote
  const activateEmeraldNote = (id: string) => {
    setEmeraldNotes((prev) =>
      prev.map((note) => ({
        ...note,
        isActive: note.id === id,
      }))
    );
    setActiveNoteId(id);
  };

  const saveCanvasAsImage = async (canvas: HTMLCanvasElement, _: number) => {
    const imageBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!imageBlob) return;
    // Add your save logic here
  };

  const savePage = async () => {
    if (canvasRef.current) {
      await saveCanvasAsImage(canvasRef.current, page);
    }
  };

  return (
    <div className="min-h-screen bg-green-50">
      <EmeraldNav currentPage={page} setPage={setPage} />

      {/* Create Note Button */}
      <div className="fixed top-20 left-4 z-40">
        <button
          onClick={createEmeraldNote}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-lg transition-colors duration-200"
        >
          Create Note 📝
        </button>
      </div>

      {/* EmeraldNotes */}
      {emeraldNotes.map((note) => (
        <EmeraldNote
          key={note.id}
          {...note}
          onUpdate={updateEmeraldNote}
          onDelete={deleteEmeraldNote}
          onActivate={activateEmeraldNote}
          onApply={handleApplyNote}
        />
      ))}

      {/* Canvas */}
      <PageCanvas notes={notes} ref={canvasRef} />

      {/* Save Button */}
      <div className="text-center mt-4">
        <button
          onClick={savePage}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow"
        >
          Save Page ✨
        </button>
      </div>
    </div>
  );
};

type PageCanvasProps = {
  notes: NoteDraw[];
};

const PageCanvas = forwardRef<HTMLCanvasElement, PageCanvasProps>(
  ({ notes }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    useImperativeHandle(ref, () => canvasRef.current!, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      notes.forEach(({ content, x, y, width, height, rotation }) => {
        ctx.save();

        const paddingX = 10;
        const paddingY = 20;

        ctx.translate(x + width / 2, y + height / 2);
        ctx.rotate((rotation * Math.PI) / 180);

        ctx.translate(-width / 2, -height / 2);

        ctx.font = "16px sans-serif";
        ctx.fillStyle = "#000";
        const lineHeight = 20;

        content.split("\n").forEach((paragraph, i) => {
          wrapText(
            ctx,
            paragraph,
            paddingX,
            paddingY + i * lineHeight * 1.5, 
            width - paddingX * 2, 
            lineHeight
          );
        });

        ctx.restore();
      });
    }, [notes]);

    return (
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className="border shadow bg-white mx-auto my-8"
      />
    );
  }
);

export default Emerald;
