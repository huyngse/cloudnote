// components/Toast.tsx
import { useEffect } from "react";

type ToastProps = {
  message: string;
  onClose: () => void;
};

export default function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000); 

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-1/2 translate-x-1/2 z-[9999] bg-blue-300 text-gray-800 px-4 py-2 rounded shadow-lg transition-opacity animate-fade-in">
      {message}
    </div>
  );
}
