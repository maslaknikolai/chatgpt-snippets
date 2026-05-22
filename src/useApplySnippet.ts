import { useAtom } from 'jotai';
import { fieldAtom } from './atoms';
import { Snippet } from './types';

export function useApplySnippet() {
  const [field] = useAtom(fieldAtom);

  return (snippet: Snippet) => {
    if (!field) {
      return;
    }
    field.innerText = snippet.content;
    field.focus();
    field.dispatchEvent(new Event('input', { bubbles: true }));

    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(field);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  };
}
