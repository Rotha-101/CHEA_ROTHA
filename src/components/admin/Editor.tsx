import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Type,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Code
} from 'lucide-react';

interface EditorProps {
  content: string;
  onChange: (html: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('URL of the image');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 sticky top-0 z-10 transition-colors">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('bold') ? 'text-amber-500 bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-500'}`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('italic') ? 'text-amber-500 bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-500'}`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('underline') ? 'text-amber-500 bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-500'}`}
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1 self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'text-amber-500 bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-500'}`}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'text-amber-500 bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-500'}`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1 self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('bulletList') ? 'text-amber-500 bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-500'}`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('orderedList') ? 'text-amber-500 bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-500'}`}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1 self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('blockquote') ? 'text-amber-500 bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-500'}`}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('codeBlock') ? 'text-amber-500 bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-500'}`}
        title="Code Block"
      >
        <Code className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1 self-center" />
      <button
        type="button"
        onClick={setLink}
        className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors ${editor.isActive('link') ? 'text-amber-500 bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-500'}`}
        title="Link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={addImage}
        className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-500"
        title="Image"
      >
        <ImageIcon className="w-4 h-4" />
      </button>
      <div className="flex-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-400"
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-400"
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none p-4 min-h-[300px] focus:outline-none focus:ring-0',
      },
    },
  });

  return (
    <div className="w-full border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950 transition-colors">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <div className="p-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 text-[10px] text-zinc-400 font-mono text-right uppercase tracking-widest">
        Tiptap Engine Node
      </div>
    </div>
  );
}
