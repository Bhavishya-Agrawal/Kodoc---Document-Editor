import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Undo2,
  Redo2,
  Pilcrow,
} from "lucide-react";

const TextEditor = ({ initialContent, onChange, readOnly = false }) => {
  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    strike: false,
    paragraph: false,
    heading1: false,
    heading2: false,
    heading3: false,
    bulletList: false,
    orderedList: false,
    blockquote: false,
    codeBlock: false,
  });

  const updateActiveStates = (editorInstance) => {
    if (!editorInstance) return;

    setActiveStates({
      bold: editorInstance.isActive("bold"),
      italic: editorInstance.isActive("italic"),
      strike: editorInstance.isActive("strike"),
      paragraph: editorInstance.isActive("paragraph"),
      heading1: editorInstance.isActive("heading", { level: 1 }),
      heading2: editorInstance.isActive("heading", { level: 2 }),
      heading3: editorInstance.isActive("heading", { level: 3 }),
      bulletList: editorInstance.isActive("bulletList"),
      orderedList: editorInstance.isActive("orderedList"),
      blockquote: editorInstance.isActive("blockquote"),
      codeBlock: editorInstance.isActive("codeBlock"),
    });
  };

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent || "<p></p>",
    editable: !readOnly,
    onUpdate: ({ editor: ed }) => {
      updateActiveStates(ed);
      if (onChange) onChange(ed.getHTML());
    },
    onSelectionUpdate: ({ editor: ed }) => {
      updateActiveStates(ed);
    },
  });

  // Update content if initialContent changes (e.g., restoring a version or loading doc)
  useEffect(() => {
    if (editor && initialContent !== undefined && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  // Update readOnly state dynamically
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  if (!editor) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Loading editor...
      </div>
    );
  }

  const toggleButtonClass = (isActive) =>
    `h-8 w-8 p-0 rounded-lg transition-colors ${
      isActive
        ? "bg-gray-900 text-white hover:bg-gray-800"
        : "text-gray-600 hover:bg-gray-200/80 hover:text-gray-900 bg-transparent"
    }`;

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
      {/* Modern Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50/90 select-none">
          {/* Text Formats */}
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={toggleButtonClass(activeStates.bold)}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={toggleButtonClass(activeStates.italic)}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={toggleButtonClass(activeStates.strike)}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Paragraph & Headings */}
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={toggleButtonClass(activeStates.paragraph)}
              title="Paragraph"
            >
              <Pilcrow className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={toggleButtonClass(activeStates.heading1)}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={toggleButtonClass(activeStates.heading2)}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={toggleButtonClass(activeStates.heading3)}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Lists & Quotes */}
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={toggleButtonClass(activeStates.bulletList)}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={toggleButtonClass(activeStates.orderedList)}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={toggleButtonClass(activeStates.blockquote)}
              title="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={toggleButtonClass(activeStates.codeBlock)}
              title="Code Block"
            >
              <Code className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className={toggleButtonClass(false)}
              title="Horizontal Divider"
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="h-8 w-8 p-0 rounded-lg text-gray-600 hover:bg-gray-200/80 disabled:opacity-30"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="h-8 w-8 p-0 rounded-lg text-gray-600 hover:bg-gray-200/80 disabled:opacity-30"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 cursor-text bg-white">
        <EditorContent
          editor={editor}
          className="min-h-[500px] outline-none max-w-3xl mx-auto focus:outline-none"
        />
      </div>
    </div>
  );
};

export default TextEditor;