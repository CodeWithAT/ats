"use client";

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Bold, Italic, Strikethrough, Code, 
  Heading1, Heading2, List, ListOrdered, Quote, Undo, Redo 
} from 'lucide-react';

// --- TOOLBAR COMPONENT ---
const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const IconButton = ({ 
    onClick, disabled = false, isActive = false, children 
  }: { 
    onClick: () => void, disabled?: boolean, isActive?: boolean, children: React.ReactNode 
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-gray-200 text-black' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      type="button"
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2 rounded-t-lg">
      <IconButton onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}><Bold size={16} /></IconButton>
      <IconButton onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}><Italic size={16} /></IconButton>
      <IconButton onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}><Strikethrough size={16} /></IconButton>
      <IconButton onClick={() => editor.chain().focus().toggleCode().run()} disabled={!editor.can().chain().focus().toggleCode().run()} isActive={editor.isActive('code')}><Code size={16} /></IconButton>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <IconButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })}><Heading1 size={16} /></IconButton>
      <IconButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}><Heading2 size={16} /></IconButton>
      
      <div className="w-px h-6 bg-gray-300 mx-1" />

      <IconButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}><List size={16} /></IconButton>
      <IconButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}><ListOrdered size={16} /></IconButton>
      <IconButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}><Quote size={16} /></IconButton>

      <div className="flex-1" />

      <IconButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()}><Undo size={16} /></IconButton>
      <IconButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()}><Redo size={16} /></IconButton>
    </div>
  );
};

// --- MAIN EDITOR COMPONENT ---
export default function TiptapEditor({ 
  content = "<p>Start writing here...</p>",
  onChange 
}: { 
  content?: string, 
  onChange?: (html: string) => void 
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[200px] p-4 text-gray-700 leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) onChange(editor.getHTML());
    },
  });

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden flex flex-col w-full">
      <MenuBar editor={editor} />
      {/* Global CSS for basic formatting inside the editor */}
      <style>{`
        .ProseMirror h1 { font-size: 1.8em; font-weight: bold; margin-bottom: 0.5em; }
        .ProseMirror h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.5em; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.5em; }
        .ProseMirror blockquote { border-left: 3px solid #e5e7eb; padding-left: 1rem; color: #6b7280; font-style: italic; }
        .ProseMirror code { background-color: #f3f4f6; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; }
        .ProseMirror p { margin-bottom: 0.5em; }
      `}</style>
      <EditorContent editor={editor} className="cursor-text bg-white" onClick={() => editor?.commands.focus()} />
    </div>
  );
}