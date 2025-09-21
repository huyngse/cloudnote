import { useSettings } from "@/contexts/SettingsContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { settings, setSetting } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-40">
      <div className="bg-white rounded shadow-lg p-6 w-80">
        <h2 className="text-lg font-bold mb-4">Settings 🎨</h2>

        <label className="block mb-4">
          <span className="text-sm font-medium">Background Color</span>
          <input
            type="color"
            value={settings.bgColor}
            onChange={(e) => setSetting("bgColor", e.target.value)}
            className="w-full h-12 cursor-pointer border rounded mt-2"
          />
        </label>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
