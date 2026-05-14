import { Snippet, SNIPPET_ACTION_TYPE } from './types';
import { createLayoutFromString } from './utils';
import { getSavedSnippets, saveSnippets } from './storage';

let chatGPTPromptFieldEl: HTMLElement;
let snippetsWrapperEl: HTMLElement;
let notificationEl: HTMLElement;

export function injectSnippets(field: HTMLElement): void {
  chatGPTPromptFieldEl = field;

  snippetsWrapperEl = createLayoutFromString(`
    <ul
      class="mf-snippets"
      aria-label="ChatGPT Snippets (Browser Extension)"
      tabindex="0"
    >
    </ul>
  `);

  notificationEl = createLayoutFromString(`
    <div class="mf-nofication" aria-live="polite"></div>
  `);

  const threadBottomContainer = field.closest('#thread-bottom-container')

  console.log('WIPWIP', threadBottomContainer, field, snippetsWrapperEl);

  threadBottomContainer!.prepend(snippetsWrapperEl);
  snippetsWrapperEl.after(notificationEl);

  const savedSnippets = getSavedSnippets();
  savedSnippets.forEach(injectSnippetBtn);
}

export function injectSnippetBtn(snippet: Snippet): void {
  const actionTypeARIAText = snippet.actionType === SNIPPET_ACTION_TYPE.APPEND
    ? 'Appending'
    : 'Replacing';

  const snippetBtn = createLayoutFromString(`
    <li
      class="
        mf-snippet
        ${snippet.actionType === SNIPPET_ACTION_TYPE.APPEND ? 'mf-snippet__append-action' : ''}
      "
    >
      <button
        class="mf-snippet__label"
        aria-label="${actionTypeARIAText} snippet: ${snippet.label}"
        role="button"
      >
        ${snippet.label}
      </button>

      <button
        class="mf-snippet__remove"
        aria-label="Remove snippet: ${snippet.label}"
        role="button"
      >
        &times;
      </button>
    </li>
  `);

  snippetsWrapperEl.prepend(snippetBtn);

  snippetBtn.querySelector<HTMLButtonElement>('.mf-snippet__label')!.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (snippet.actionType === SNIPPET_ACTION_TYPE.APPEND) {
        console.log('WIPWIP');
    //   chatGPTPromptFieldEl.value = `${chatGPTPromptFieldEl.value}${snippet.content}`;
    } else {
        console.log('WIPWIP');
    //   chatGPTPromptFieldEl.value = snippet.content;
    }

    chatGPTPromptFieldEl.focus();
    chatGPTPromptFieldEl.dispatchEvent(new Event('input', { bubbles: true }));
  };

  snippetBtn.querySelector<HTMLButtonElement>('.mf-snippet__remove')!.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const savedSnippets = getSavedSnippets();
    const snippetsWithoutRemoved = savedSnippets.filter(it => it.id !== snippet.id);
    saveSnippets(snippetsWithoutRemoved);

    snippetBtn.remove();
    showNotification(`Snippet removed: "${snippet.label}"`);
  };
}

export function showNotification(text: string): void {
  notificationEl.innerText = text;
  setTimeout(() => {
    notificationEl.innerText = '';
  }, 4000);
}
