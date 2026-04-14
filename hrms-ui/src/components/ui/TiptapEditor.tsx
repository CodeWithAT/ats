"use client";

import { useRef, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Image as TiptapImage } from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

import { 
  Bold, Italic, Strikethrough, Code, 
  Heading1, Heading2, List, ListOrdered, Quote, Undo, Redo,
  ImageIcon, Table as TableIcon, PlusSquare, MinusSquare, CheckSquare, XSquare
} from 'lucide-react';

// --- TOOLBAR COMPONENT ---
const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const IconButton = ({ 
    onClick, disabled = false, isActive = false, children, title 
  }: { 
    onClick: () => void, disabled?: boolean, isActive?: boolean, children: React.ReactNode, title?: string 
  }) => (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick} disabled={disabled} title={title}
      className={`p-1.5 sm:p-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
        isActive 
          ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
      } disabled:opacity-50 disabled:cursor-not-allowed shrink-0`}
      type="button"
    >
      {children}
    </button>
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64ImageSrc = e.target?.result as string;
        editor.chain().focus().setImage({ src: base64ImageSrc }).run();
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col border-b border-gray-200 bg-gray-50/80 p-2 rounded-t-lg gap-2 overflow-x-auto">
      <div className="flex items-center gap-1 min-w-max">
        <IconButton onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold"><Bold size={16} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic"><Italic size={16} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={16} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleCode().run()} disabled={!editor.can().chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Code"><Code size={16} /></IconButton>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <IconButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1"><Heading1 size={16} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={16} /></IconButton>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <IconButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List"><List size={16} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List"><ListOrdered size={16} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote"><Quote size={16} /></IconButton>
        <div className="flex-1 min-w-[20px]" />
        <IconButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} title="Undo"><Undo size={16} /></IconButton>
        <IconButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} title="Redo"><Redo size={16} /></IconButton>
      </div>

      <div className="flex items-center gap-1 pt-1 border-t border-gray-200 min-w-max">
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
        <IconButton title="Upload Local Image" onClick={() => fileInputRef.current?.click()}><ImageIcon size={16} className="text-blue-600" /></IconButton>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {!editor.isActive('table') ? (
          <IconButton title="Insert Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
            <TableIcon size={16} className="text-green-600" />
            <span className="text-[13px] font-medium pr-1">Insert Table</span>
          </IconButton>
        ) : (
          <div className="flex items-center gap-1 bg-green-50/50 p-1 rounded-md border border-green-100">
            <IconButton title="Add Row After" onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()}>
               <span className="text-[13px] font-medium px-1 text-green-700">Add Row</span>
            </IconButton>
            <IconButton title="Delete Row" onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.can().deleteRow()}>
               <span className="text-[13px] font-medium px-1 text-red-600">Delete Row</span>
            </IconButton>
            <div className="w-px h-4 bg-green-200 mx-1" />
            <IconButton title="Add Column After" onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.can().addColumnAfter()}>
               <span className="text-[13px] font-medium px-1 text-green-700">Add Col</span>
            </IconButton>
            <IconButton title="Delete Column" onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.can().deleteColumn()}>
               <span className="text-[13px] font-medium px-1 text-red-600">Delete Col</span>
            </IconButton>
            <div className="w-px h-4 bg-green-200 mx-1" />
            <IconButton title="Delete Table" onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.can().deleteTable()}>
               <span className="text-[13px] font-medium px-1 text-red-700">Delete Table</span>
            </IconButton>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN EDITOR COMPONENT ---
export default function TiptapEditor({ 
  content = "", 
  onChange 
}: { 
  content?: string, 
  onChange?: (html: string) => void 
}) {
  const [updateIndex, setUpdateIndex] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write the full job description here...',
        emptyEditorClass: 'is-editor-empty',
      }),
      TiptapImage.configure({ inline: true, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content,
    editorProps: { 
      attributes: { 
        class: 'focus:outline-none w-full min-h-full' 
      } 
    },
    onUpdate: ({ editor }) => { if (onChange) onChange(editor.getHTML()); },
    onTransaction: () => { setUpdateIndex((val) => val + 1); },
    onSelectionUpdate: () => { setUpdateIndex((val) => val + 1); },
  });

  return (
    // The Main Wrapper: Fully responsive width
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white flex flex-col w-full relative focus-within:ring-1 focus-within:ring-gray-400 focus-within:border-gray-400 transition-all">
      <MenuBar editor={editor} />
      
      
      <div className="w-full flex-1 min-h-[300px] max-h-[60vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 bg-white rounded-b-lg">
        <EditorContent editor={editor} className="cursor-text w-full h-full" onClick={() => editor?.commands.focus()} />
      </div>
      
      {/* SCALABLE UI CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Text Defaults */
        .ProseMirror p {
          margin-bottom: 0.75em;
          color: #374151;
          font-size: 15px;
          line-height: 1.6;
        }

        .ProseMirror h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-top: 1.25em;
          margin-bottom: 0.5em;
          line-height: 1.3;
        }

        .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-top: 1.25em;
          margin-bottom: 0.5em;
          line-height: 1.4;
        }

        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1em;
          margin-top: 0.5em;
          color: #374151;
        }

        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1em;
          margin-top: 0.5em;
          color: #374151;
        }

        .ProseMirror li {
          margin-bottom: 0.25em;
        }

        .ProseMirror blockquote {
          border-left: 3px solid #d1d5db;
          padding-left: 1rem;
          margin: 1.5em 0;
          font-style: italic;
          color: #4b5563;
          background-color: #f9fafb;
          padding: 0.5rem 1rem;
          border-radius: 0 4px 4px 0;
        }

        .ProseMirror code {
          background-color: #f1f5f9;
          color: #0f172a;
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.85em;
          border: 1px solid #e2e8f0;
        }

        .ProseMirror pre {
          background-color: #1e293b;
          color: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          margin: 1.5em 0;
          overflow-x: auto;
        }

        .ProseMirror pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
          border: none;
          font-size: 0.9em;
        }

        /* Placeholder Styling */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        
        /* Premium Responsive Table Styling */
        .ProseMirror table { 
          width: 100% !important; 
          border-collapse: separate !important; 
          border-spacing: 0 !important;
          margin: 1.5rem 0 !important; 
          background-color: white !important;
          border-radius: 8px !important;
          box-shadow: 0 0 0 1px #e5e7eb !important;
          overflow: hidden !important;
          box-sizing: border-box;
          table-layout: auto;
        }
        
        .ProseMirror th { 
          background-color: #f9fafb !important; 
          font-weight: 600 !important; 
          text-transform: uppercase !important;
          font-size: 11px !important;
          letter-spacing: 0.05em !important;
          color: #6b7280 !important;
          text-align: left !important;
          padding: 12px 16px !important; 
          border-bottom: 1px solid #e5e7eb !important;
          border-right: 1px solid #e5e7eb !important;
        }
        
        .ProseMirror td { 
          padding: 16px !important; 
          font-size: 13px !important;
          color: #111827 !important;
          border-bottom: 1px solid #f3f4f6 !important;
          border-right: 1px solid #e5e7eb !important;
          vertical-align: top !important;
          word-break: break-word; /* Prevents long text from breaking table width */
        }

        .ProseMirror th:last-child,
        .ProseMirror td:last-child {
          border-right: none !important;
        }
        .ProseMirror tr:last-child td {
          border-bottom: none !important;
        }

        /* Responsive Images */
        .ProseMirror img { 
          max-width: 100%; 
          height: auto; 
          border-radius: 6px; 
          display: block; 
          margin: 16px 0; 
          border: 1px solid #e5e7eb; 
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          box-sizing: border-box;
        }
      `}} />
    </div>
  );
}