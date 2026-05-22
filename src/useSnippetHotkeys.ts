import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { snippetsAtom } from './atoms';
import { useApplySnippet } from './useApplySnippet';

export function useSnippetHotkeys() {
  const [snippets] = useAtom(snippetsAtom);
  const applySnippet = useApplySnippet();

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.altKey && e.code.startsWith('Digit')) {
        e.preventDefault()
        let number = Number(e.code.replace('Digit', ''));

        if (number === 0) {
          number = 10
        }

        const snippet = snippets[number - 1]

        if (!snippet) {
          return
        }

        applySnippet(snippet)
      }
    }

    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [snippets])
}
