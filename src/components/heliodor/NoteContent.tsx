// NoteContent.tsx
type NoteContentProps = {
  content: string;
  decorMode: boolean;
  lockDecor: boolean;
  onContentChange: (content: string) => void;
  onDoubleClick?: () => void;
};

export const NoteContent = ({
  content,
  decorMode,
  lockDecor,
  onContentChange,
  onDoubleClick,
}: NoteContentProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
  };

  const isImage = content.startsWith("data:image");

  return isImage ? (
    <img
      src={content}
      alt="clipboard"
      className="w-full h-[calc(100%-2rem)] object-contain"
      onDoubleClick={decorMode && !lockDecor ? onDoubleClick : undefined}
    />
  ) : (
    <textarea
      readOnly={decorMode}
      tabIndex={decorMode ? -1 : 0}
      className="w-full h-[calc(100%-2rem)] resize-none bg-transparent focus:outline-none p-2"
      value={content}
      onChange={handleChange}
      onDoubleClick={decorMode && !lockDecor ? onDoubleClick : undefined}
    />
  );
};
