// ==UserScript==
// @name         ChatGPT Snippets
// @namespace    maslaknikolai
// @match        https://chat.openai.com/*
// @version      1.0.0
// @run-at       document-end
// @author       Nikolai Maslak
// @updateURL    https://github.com/maslaknikolai/chatgpt-snippets/raw/master/chatgpt-snippets.meta.js
// @downloadURL  https://github.com/maslaknikolai/chatgpt-snippets/raw/master/chatgpt-snippets.user.js
// @description  Simple snippet buttons above the main chat field
// ==/UserScript==


let field = null;
let snippetsWrapper = null;

function init() {
  const foundField = document.querySelector('textarea[placeholder="Send a message."]')

  if (!foundField || foundField === field) {
    return
  }

  field = foundField

  snippetsWrapper = createLayoutFromString(`
    <div class="mf-snippets">
    </div>
  `)

  injectSnippets();
  injectSaveSnippetBtn();
}

setInterval(init, 1000)
document.head.append(createLayoutFromString(`
  <style>
    .mf-save-snippet-btn {
      position: absolute;
      right: 50px;
      bottom: 12px;
      height: 24px;
      background: rgb(73 83 219);
      border-radius: 6px;
      width: 24px;
      padding: 3px;
    }

    .mf-snippets {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }

    .mf-snippet {
      position: relative;
      overflow: hidden;
      background: rgb(73 83 219);
      border-radius: 6px;
      padding-right: 20px;
      display: flex;
    }

    .mf-snippet__text {
      font-size: 11px;
      max-width: 220px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      padding: 3px 5px;
    }

    .mf-snippet__text:hover {
      cursor: pointer;
      background: rgba(255, 255, 255, .1);
      transition: background .2s;
    }

    .mf-snippet__remove {
      position: absolute;
      right: 0;
      font-size: 18px;
      line-height: inherit;
      height: 100%;
      top: 0;
      width: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-grow: 0;
    }

    .mf-snippet__remove::before {
      content: '';
      position: absolute;
      left: -1px;
      background: rgba(255,255,255,.3);
      height: 100%;
      width: 1px;
    }

    .mf-snippet__remove:hover {
      cursor: pointer;
      background: rgba(255, 255, 255, .1);
      transition: background .2s;
    }
  </style>
`))

function injectSnippets() {
  field.parentElement.before(snippetsWrapper);

  const savedSnippets = getSavedSnippets();

  savedSnippets.forEach(injectSnippetBtn)
}

function injectSnippetBtn(snippet) {
  const snippetBtn = createLayoutFromString(`
    <div class="mf-snippet">
      <div class="mf-snippet__text">
        ${snippet}
      </div>

      <div class="mf-snippet__remove">
        &times;
      </div>
    </div>
  `)

  snippetsWrapper.prepend(snippetBtn)

  snippetBtn.querySelector('.mf-snippet__text').onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    field.value = snippet;
    field.focus();
    field.dispatchEvent(new Event('input', { bubbles: true })); // trigger field resize
  }

  snippetBtn.querySelector('.mf-snippet__remove').onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeSnippet(snippetBtn, snippet);
  }
}

function removeSnippet(snippetBtn, snippet) {
  snippetBtn.remove();
  const savedSnippets = getSavedSnippets();
  const removingSnippetIndex = savedSnippets.indexOf(snippet);
  savedSnippets.splice(removingSnippetIndex, 1);
  saveSnippets(savedSnippets);
}

function injectSaveSnippetBtn() {
  const saveSnippetBtn = createLayoutFromString(`
    <button class="mf-save-snippet-btn">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 8.98987V20.3499C16 21.7999 14.96 22.4099 13.69 21.7099L9.76001 19.5199C9.34001 19.2899 8.65999 19.2899 8.23999 19.5199L4.31 21.7099C3.04 22.4099 2 21.7999 2 20.3499V8.98987C2 7.27987 3.39999 5.87988 5.10999 5.87988H12.89C14.6 5.87988 16 7.27987 16 8.98987Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M22 5.10999V16.47C22 17.92 20.96 18.53 19.69 17.83L16 15.77V8.98999C16 7.27999 14.6 5.88 12.89 5.88H8V5.10999C8 3.39999 9.39999 2 11.11 2H18.89C20.6 2 22 3.39999 22 5.10999Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7 12H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 14V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  `)

  field.parentElement.append(saveSnippetBtn)

  saveSnippetBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    saveSnippet()
  }
}

function getSavedSnippets() {
  try {
    return JSON.parse(localStorage.getItem('chatgpt_snippets.snippets')) || []
  } catch {
    return [];
  }
}

function saveSnippets(savingSnippets) {
  return localStorage.setItem(
    'chatgpt_snippets.snippets',
    JSON.stringify(savingSnippets)
  );
}

function saveSnippet() {
  const newSnippet = field.value;

  const savedSnippets = getSavedSnippets();
  savedSnippets.push(newSnippet);

  saveSnippets(savedSnippets);

  injectSnippetBtn(newSnippet);
}

function createLayoutFromString(template) {
  const div = document.createElement('div')
  div.innerHTML = template

  return div.children[0]
}
