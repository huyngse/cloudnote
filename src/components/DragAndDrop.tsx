import React, { useCallback, useState } from "react";

type DragAndDropProps = {
  onDrop: (files: FileList) => void;
  children?: React.ReactNode;
  className?: string;
  activeClassName?: string;
};

const DragAndDrop: React.FC<DragAndDropProps> = ({
  onDrop,
  children,
  className = "",
  activeClassName = "",
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer?.files?.length) {
        onDrop(e.dataTransfer.files);
      }
    },
    [onDrop]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`${className} ${isDragging ? activeClassName : ""}`}
    >
      {children ?? (
        <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-400 rounded-lg text-gray-600">
          <p>Drop your file here~! (＾▽＾)</p>
        </div>
      )}
    </div>
  );
};

export default DragAndDrop;
