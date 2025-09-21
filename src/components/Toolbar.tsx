import { useToast } from "@/hooks/useToast";
import { exportNotes, importNotesFromFile } from "@/utils/indexedDbUtils";
import { useRef, useState } from "react";
import SettingsModal from "./SettingModals";

// components/Toolbar.tsx
interface ToolbarProps {
  addNote: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  lockDecor: boolean;
  setLockDecor: React.Dispatch<React.SetStateAction<boolean>>;
  addGuideNote: () => void;
}
const Toolbar = ({
  addNote,
  fileInputRef,
  handleImageUpload,
  lockDecor,
  setLockDecor,
  addGuideNote,
}: ToolbarProps) => {
  const { showToast } = useToast();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleExport = () => {
    exportNotes()
      .then(() => showToast("Notes exported successfully! 📤✨"))
      .catch(() => showToast("Failed to export notes (；▽；)"));
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importNotesFromFile(file);
      showToast("Notes imported successfully! 📥💖");
      window.location.reload();
    } catch (e) {
      showToast("Failed to import notes! (っ °Д °;)っ");
    }

    // Reset the input so same file can be selected again if needed
    event.target.value = "";
  };

  return (
    <div className="flex justify-end bottom-0 gap-3 fixed w-full z-[1000] p-3">
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
        hidden
      />
      <input
        type="file"
        accept="application/json"
        ref={importInputRef}
        onChange={handleFileChange}
        className="hidden"
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
        onClick={handleExport}
        className="bg-white shadow rounded-full p-2 text-sm hover:bg-gray-100 cursor-pointer duration-300"
        title="💾 Export backup"
      >
        💾
      </button>
      <button
        onClick={handleImportClick}
        className="bg-white shadow rounded-full p-2 text-sm hover:bg-gray-100 cursor-pointer duration-300"
        title="📂 Import backup"
      >
        📂
      </button>
      <button
        onClick={addGuideNote}
        className="bg-white shadow rounded-full p-2 text-sm hover:bg-gray-100 cursor-pointer duration-300"
        title="❓ How to use"
      >
        ❓
      </button>
      <button
        className="bg-white shadow rounded-full p-2 text-sm hover:bg-gray-100 cursor-pointer duration-300"
        title="Settings"
        onClick={() => setIsSettingsModalOpen(true)}
      >
        ⚙️
      </button>
    </div>
  );
};

export default Toolbar;
