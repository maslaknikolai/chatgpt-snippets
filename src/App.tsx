import { useAtom, useSetAtom } from 'jotai';
import { fieldAtom, snippetsAtom } from './atoms';
import { SnippetItem } from './SnippetItem';
import { AddSnippetButton } from './AddSnippetButton';
import { useEffect } from 'react';
import { useSnippetsStorage } from './useSnippetsStorage';
import { useSnippetHotkeys } from './useSnippetHotkeys';


export function App({ field }: {
  field: HTMLElement;
}) {
  const [snippets] = useAtom(snippetsAtom);
  const setField = useSetAtom(fieldAtom);
  useSnippetsStorage();
  useSnippetHotkeys();

  useEffect(() => {
    setField(field);
  }, [field]);

  return (
    <>
      <div
        className="flex flex-wrap gap-2 mb-2 max-h-[90px] overflow-auto"
        aria-label="ChatGPT Snippets (Browser Extension)"
        tabIndex={0}
      >
        {snippets.map(snippet => (
          <SnippetItem
            key={snippet.id}
            snippet={snippet}
          />
        ))}

        <AddSnippetButton />
      </div>
    </>
  );
}
