import { marked } from "marked";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";

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
  const [htmlContent, setHtmlContent] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
  };

  const isImage = content.startsWith("data:image");

  if (isImage) {
    return (
      <img
        src={content}
        alt="clipboard"
        className="w-full h-[calc(100%-2rem)] object-contain"
        onDoubleClick={decorMode && !lockDecor ? onDoubleClick : undefined}
      />
    );
  }

  useEffect(() => {
    const renderMarkdown = async () => {
      const html = await marked(content);
      const cleanHtml = DOMPurify.sanitize(html);
      setHtmlContent(cleanHtml);
    };
    renderMarkdown();
  }, [content]);

  return decorMode ? (
    <div
      className="w-full h-[calc(100%-2rem)] select-text relative"
      onDoubleClick={!lockDecor ? onDoubleClick : undefined}
      title={decorMode ? "Double click to toggle decor mode" : undefined}
    >
      <div className="absolute w-full h-full"></div>
      <div
        className="prose prose-sm max-w-none overflow-auto p-2"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  ) : (
    <textarea
      readOnly={false}
      tabIndex={0}
      className="w-full h-[calc(100%-2rem)] resize-none bg-transparent focus:outline-none p-2"
      value={content}
      onChange={handleChange}
      onDoubleClick={!lockDecor ? onDoubleClick : undefined}
    />
  );
};
