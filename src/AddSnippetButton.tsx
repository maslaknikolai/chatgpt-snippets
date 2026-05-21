import { useAtom } from 'jotai';
import { fieldAtom, snippetsAtom } from './atoms';

export function AddSnippetButton() {
  const [field] = useAtom(fieldAtom);
  const [, setSnippets] = useAtom(snippetsAtom);

  const createSnippet = () => {
    const label = prompt('Name?');

    if (!label || !field) {
      return;
    }

    setSnippets(prev => [
      {
        id: crypto.randomUUID(),
        content: field.innerText,
        label,
      },
      ...prev,
    ]);
  };

  return (
    <button
      className="cursor-pointer rounded-md bg-indigo-600 w-6 h-6 text-white text-xl leading-none flex items-center justify-center hover:bg-indigo-500 transition-colors duration-200"
      aria-label="Create snippet from current prompt"
      onClick={createSnippet}
    >
      +
    </button>
  );
}
