// ==UserScript==
// @name        ChatGPT Snippets
// @namespace   maslaknikolai
// @match       https://chat.openai.com/*
// @version     1.0.0
// @run-at      document-end
// @author      Nikolai Maslak
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// @updateURL    https://raw.githubusercontent.com/maslaknikolai/chatgpt-snippets/chatgpt-snippets.meta.js
// @downloadURL  https://raw.githubusercontent.com/maslaknikolai/chatgpt-snippets/chatgpt-snippets.user.js
// @description Simple snippet buttons above the main chat field
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
      border: 1px solid;
      width: 24px;
    }

    .mf-snippets {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }

    .mf-snippet {
      position: relative;
      padding: 3px 5px;
      max-width: 220px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: 10px;
      border: 1px solid;
      border-radius: 5px;
      padding-right: 20px;
    }

    .mf-snippet:hover {
      cursor: pointer;
      background: rgba(255, 255, 255, .1)
    }

    .mf-snippet-remove {
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
    }

    .mf-snippet:hover {
      background: rgba(255, 255, 255, .1)
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
      ${snippet}

      <div class="mf-snippet-remove">
        &times;
      </div>
    </div>
  `)

  snippetsWrapper.prepend(snippetBtn)

  snippetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    field.value = snippet;
    field.focus();
    field.dispatchEvent(new Event('input', { bubbles: true })); // trigger field resize
  })
}

function injectSaveSnippetBtn() {
  const saveSnippetBtn = createLayoutFromString(`
    <button class="mf-save-snippet-btn">S</button>
  `)

  field.parentElement.append(saveSnippetBtn)

  saveSnippetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    saveSnippet()
  })
}

function getSavedSnippets() {
  return GM_getValue('chatgpt_snippets.snippets') || [];
}

function saveSnippet() {
  const newSnippet = field.value;

  const savedSnippets = getSavedSnippets();
  savedSnippets.push(newSnippet);

  GM_setValue('chatgpt_snippets.snippets', savedSnippets);

  injectSnippetBtn(newSnippet);
}

function createLayoutFromString(template) {
  const div = document.createElement('div')
  div.innerHTML = template

  return div.children[0]
}
