import { useEffect } from 'react';
import { useAtom } from 'jotai';
import Browser from 'webextension-polyfill';
import { snippetsAtom } from './atoms';

export function useSnippetsStorage() {
  const [snippets, setSnippets] = useAtom(snippetsAtom);

  useEffect(() => {
    Browser.storage.local.get('snippets').then(res => {
      if (res.snippets) {
        setSnippets(res.snippets);
      }
    });
  }, []);

  useEffect(() => {
    if (snippets) {
      Browser.storage.local.set({ snippets });
    }
  }, [snippets]);
}
