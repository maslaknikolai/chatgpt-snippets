import { useAtom } from 'jotai';
import { snippetsAtom } from './atoms';
import { Snippet } from './types';
import { useApplySnippet } from './useApplySnippet';

interface Props {
  snippet: Snippet;
}

export function SnippetItem({ snippet }: Props) {
  const [, setSnippets] = useAtom(snippetsAtom);
  const applySnippet = useApplySnippet();

  const handleRemove = () => {
    setSnippets(prev => prev.filter(it => it.id !== snippet.id));
  }

  const handleMove = (direction: 'back' | 'forward') => {
    setSnippets(prev => {
      const index = prev.findIndex(it => it.id === snippet.id);
      const targetIndex = direction === 'back' ? index - 1 : index + 1;

      const isOutOfBounds = targetIndex < 0 || targetIndex >= prev.length;
      if (isOutOfBounds) {
        return prev;
      }

      const reordered = [...prev];
      reordered.splice(index, 1);
      reordered.splice(targetIndex, 0, snippet);

      return reordered;
    });
  };

  return (
    <div className="group relative overflow-hidden rounded-md pr-5 flex text-white bg-indigo-600">
      <button
        className="opacity-0 group-hover:opacity-100 text-[10px] px-1 cursor-pointer hover:bg-white/10 transition-all duration-200"
        aria-label={`Move snippet left: ${snippet.label}`}
        onClick={e => { e.preventDefault(); e.stopPropagation(); handleMove('back'); }}
      >
        &lsaquo;
      </button>

      <button
        className="text-[11px] max-w-[220px] truncate py-[3px] px-[5px] cursor-pointer hover:bg-white/10 transition-colors duration-200"
        aria-label={`Snippet: ${snippet.label}`}
        onClick={() => applySnippet(snippet)}
      >
        {snippet.label}
      </button>

      <button
        className="opacity-0 group-hover:opacity-100 text-[10px] px-1 cursor-pointer hover:bg-white/10 transition-all duration-200"
        aria-label={`Move snippet right: ${snippet.label}`}
        onClick={e => { e.preventDefault(); e.stopPropagation(); handleMove('forward'); }}
      >
        &rsaquo;
      </button>

      <button
        className="absolute right-0 text-[18px] h-full top-0 w-5 flex justify-center items-center shrink-0 cursor-pointer hover:bg-white/10 transition-colors duration-200 before:content-[''] before:absolute before:-left-px before:bg-white/30 before:h-full before:w-px"
        aria-label={`Remove snippet: ${snippet.label}`}
        onClick={handleRemove}
      >
        &times;
      </button>
    </div>
  );
}
