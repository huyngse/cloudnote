// src/contexts/DragContext.tsx
import {
  createContext,
  useContext,
  useRef,
  type RefObject,
  type ReactNode,
} from "react";

type EditorContextType = {
  isDraggingNoteRef: RefObject<boolean>;
  isResizingNoteRef: RefObject<boolean>;
  isRotatingNoteRef: RefObject<boolean>;
};

const EditorContext = createContext<EditorContextType | null>(null);

export const EditorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const isDraggingNoteRef = useRef(false);
  const isResizingNoteRef = useRef(false);
  const isRotatingNoteRef = useRef(false);

  return (
    <EditorContext.Provider
      value={{ isDraggingNoteRef, isResizingNoteRef, isRotatingNoteRef }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within a EditorProvider!");
  }
  return context;
};
