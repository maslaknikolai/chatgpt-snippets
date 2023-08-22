// ==UserScript==
// @name         ChatGPT Snippets
// @namespace    maslaknikolai
// @match        https://chat.openai.com/*
// @version      1.2.0
// @run-at       document-end
// @author       Nikolai Maslak
// @updateURL    https://github.com/maslaknikolai/chatgpt-snippets/raw/master/chatgpt-snippets.meta.js
// @downloadURL  https://github.com/maslaknikolai/chatgpt-snippets/raw/master/chatgpt-snippets.user.js
// @description  Simple snippet buttons above the main chat field
// ==/UserScript==

const SNIPPET_ACTION_TYPE = {
  REPLACE: 'replace', // replace field value on click
  APPEND: 'append', // append to field value on click
}

const COLORS = {
  PRIMARY: 'rgb(73 83 219)',
  APPEND_ACTION_FEATURE: 'rgb(219 100 73)',
}

const ARIA_DESCRIPTIONS = {
  BTN_FIRST_STEP: 'Go to next step',
  BTN_SECOND_STEP: 'Click to add',
}

let chatGPTPromptFieldEl = null;
let snippetsWrapperEl = null;
let notificationEl = null;
let snippetFormPopupEl = null;
let snippetFormEl = null;
let labelInputFieldEl = null;
let actionTypeRadios = [];
let snippetFormStepsEl = null;
let saveSnippetBtnEl = null;
let isLabelChangedByUser = false
let stepOfSnippetForm = 1

function init() {
  const foundChatGPTPromptField = document.getElementById('prompt-textarea')
  const isSnippetsWrapperInjected = !!document.querySelector('.mf-snippets')

  if (
    !foundChatGPTPromptField
    || isSnippetsWrapperInjected
  ) {
    return
  }

  chatGPTPromptFieldEl = foundChatGPTPromptField

  injectSnippets();
  injectSnippetFormPopup();
}

setInterval(init, 1000)

function injectSnippets() {
  snippetsWrapperEl = createLayoutFromString(`
    <ul
      class="mf-snippets"
      aria-label="ChatGPT Snippets (Browser Extension)"
      tabindex="0"
    >
    </ul>
  `)

  notificationEl = createLayoutFromString(`
    <div class="mf-nofication" aria-live="polite"></div>
  `)

  chatGPTPromptFieldEl.parentElement.parentElement.before(snippetsWrapperEl);
  snippetsWrapperEl.after(notificationEl);

  const savedSnippets = getSavedSnippets();

  savedSnippets.forEach(injectSnippetBtn)
}

function injectSnippetBtn(snippet) {
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
  `)

  snippetsWrapperEl.prepend(snippetBtn)

  snippetBtn.querySelector('.mf-snippet__label').onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (snippet.actionType === SNIPPET_ACTION_TYPE.APPEND) {
      chatGPTPromptFieldEl.value = `${chatGPTPromptFieldEl.value}${snippet.content}`;
    } else {
      chatGPTPromptFieldEl.value = snippet.content;
    }

    chatGPTPromptFieldEl.focus();
    chatGPTPromptFieldEl.dispatchEvent(new Event('input', { bubbles: true })); // trigger field resize
  }

  snippetBtn.querySelector('.mf-snippet__remove').onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const savedSnippets = getSavedSnippets();
    const snippetsWithoutRemoved = savedSnippets.filter(it => it.id !== snippet.id);
    saveSnippets(snippetsWithoutRemoved);

    snippetBtn.remove();
    showNotification(`Snippet removed: "${snippet.label}"`)
  }
}

function tryToGoStep2() {
  if (!labelInputFieldEl.value.length) {
    return
  }

  setSnippetFormStep(2);
  saveSnippetBtnEl.setAttribute('aria-label', ARIA_DESCRIPTIONS.BTN_SECOND_STEP)
  actionTypeRadios[0].focus()
}

function resetForm() {
  setSnippetFormStep(1)
  labelInputFieldEl.value = '';
  isLabelChangedByUser = false;
  actualizeSaveSnippetBtnDisabledState()
}

function injectSnippetFormPopup() {
  saveSnippetBtnEl = createLayoutFromString(`
    <button
      class="mf-save-snippet-btn"
      aria-label="${ARIA_DESCRIPTIONS.BTN_FIRST_STEP}"
      disabled
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 8.98987V20.3499C16 21.7999 14.96 22.4099 13.69 21.7099L9.76001 19.5199C9.34001 19.2899 8.65999 19.2899 8.23999 19.5199L4.31 21.7099C3.04 22.4099 2 21.7999 2 20.3499V8.98987C2 7.27987 3.39999 5.87988 5.10999 5.87988H12.89C14.6 5.87988 16 7.27987 16 8.98987Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M22 5.10999V16.47C22 17.92 20.96 18.53 19.69 17.83L16 15.77V8.98999C16 7.27999 14.6 5.88 12.89 5.88H8V5.10999C8 3.39999 9.39999 2 11.11 2H18.89C20.6 2 22 3.39999 22 5.10999Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7 12H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 14V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  `)

  saveSnippetBtnEl.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (stepOfSnippetForm === 1) {
      tryToGoStep2()
      return
    }

    if (stepOfSnippetForm === 2) {
      chatGPTPromptFieldEl.focus()
      addSnippet()
      resetForm()
      chatGPTPromptFieldEl.value = '';
    }
  }

  snippetFormPopupEl = createLayoutFromString(`
    <div class="mf-snippet-form-popup">
      <form class="mf-snippet-form-popup__form">
        <div class="mf-snippet-form-popup-steps">
          <div class="mf-snippet-form-popup-steps__item mf-snippet-form-label-step">
            <label
              class="mf-snippet-form-popup-steps__item-title"
              for="labelOfLabelStep"
            >
              1/2. Snippet label:
            </label>

            <input
              type="text"
              name="label"
              id="labelOfLabelStep"
              class="mf-snippet-form-label-step__input"
            />
          </div>

          <!-- Step 2 -->

          <div class="mf-snippet-form-popup-steps__item mf-new-snippet-popup-action-type-step">

            <label
              class="mf-snippet-form-popup-steps__item-title"
              id="labelOfActionTypeStep"
            >
              2/2. After click on snippet
            </label>

            <div
              class="mf-new-snippet-popup-action-type-step__content"
              role="radiogroup"
              aria-labeledby="labelOfActionTypeStep"
            >
              <label class="mf-radio">
                <input
                  type="radio"
                  value="replace"
                  name="actionType"
                  disabled
                  tabindex="-1"
                  checked
                />

                <div class="mf-radio__circle">
                  <div class="mf-radio__dot"></div>
                </div>

                <div class="mf-radio__text">
                  Replace field value
                </div>
              </label>

              <label class="mf-radio mf-action-type-append-radio">
                <input
                  type="radio"
                  value="append"
                  name="actionType"
                  disabled
                  tabindex="-1"
                />

                <div class="mf-radio__circle">
                  <div class="mf-radio__dot"></div>
                </div>

                <div class="mf-radio__text">
                  Add to field value
                </div>
              </label>
            </div>

          </div>
        </div>
      </form>

      <div class="mf-snippet-form-popup-arrow"></div>
    </div>
  `)

  chatGPTPromptFieldEl.parentElement.append(snippetFormPopupEl)
  chatGPTPromptFieldEl.parentElement.append(saveSnippetBtnEl)

  labelInputFieldEl = snippetFormPopupEl.querySelector('.mf-snippet-form-label-step__input')
  snippetFormStepsEl = snippetFormPopupEl.querySelector('.mf-snippet-form-popup-steps')
  snippetFormEl = snippetFormPopupEl.querySelector('.mf-snippet-form-popup__form')
  actionTypeRadios = [...snippetFormPopupEl.querySelectorAll('.mf-radio input')]

  const allFormFocusables = [...actionTypeRadios, labelInputFieldEl, saveSnippetBtnEl]
  const checkIfFocusInForm = () => (
    allFormFocusables.includes(document.activeElement)
    || document.activeElement === saveSnippetBtnEl
  )

  const [runHideDebounce, cancelHideDebounce] = debounce(() => {
    if (checkIfFocusInForm()) {
      return;
    }

    setSnippetFormStep(1);
    snippetFormPopupEl.style.opacity = 0;
    snippetFormPopupEl.style.pointerEvents = 'none';
  }, 300)

  const show = () => {
    cancelHideDebounce()
    snippetFormPopupEl.style.opacity = 1;
    snippetFormPopupEl.style.pointerEvents = 'auto';
  }

  const showOrHideDependsOnFormFocus = () => {
    if (checkIfFocusInForm()) {
      show()
    } else {
      runHideDebounce()
    }
  }

  saveSnippetBtnEl.onmouseover = show
  saveSnippetBtnEl.onmouseleave = runHideDebounce
  snippetFormPopupEl.onmouseover = show
  snippetFormPopupEl.onmouseleave = runHideDebounce

  allFormFocusables.forEach((it) => {
    it.onfocus = showOrHideDependsOnFormFocus;
    it.onblur = showOrHideDependsOnFormFocus;
  })

  labelInputFieldEl.oninput = (e) => {
    isLabelChangedByUser = !!e.target.value.length
    actualizeSaveSnippetBtnDisabledState()
  };

  labelInputFieldEl.addEventListener('focus', (e) => {
    setSnippetFormStep(1)
  })

  labelInputFieldEl.onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      tryToGoStep2()
    }
  }

  chatGPTPromptFieldEl.addEventListener('input', () => {
    if (isLabelChangedByUser) {
      return
    }

    labelInputFieldEl.value = chatGPTPromptFieldEl.value;
    actualizeSaveSnippetBtnDisabledState()
  })
}

const actualizeSaveSnippetBtnDisabledState = () => {
  const isDisabled = !labelInputFieldEl.value.length

  saveSnippetBtnEl.disabled = isDisabled
  actionTypeRadios.forEach((it) => {
    it.disabled = isDisabled
  })
}

const setSnippetFormStep = (newStep) => {
  stepOfSnippetForm = newStep;
  snippetFormStepsEl.style.transform = `translateY(-${(newStep - 1) * 44}px)`

  if (newStep === 1) {
    saveSnippetBtnEl.setAttribute('aria-label', ARIA_DESCRIPTIONS.BTN_FIRST_STEP)
    actionTypeRadios.forEach(it => it.setAttribute('tabindex', '-1'))
  } else {
    saveSnippetBtnEl.setAttribute('aria-label', ARIA_DESCRIPTIONS.BTN_SECOND_STEP)
    actionTypeRadios.forEach(it => it.removeAttribute('tabindex'))
  }
}

function getSavedSnippets() {
  try {
    const savedSnippetsVersionIndex = localStorage.getItem('chatgpt_snippets.version') || 0
    const savedSnippets = JSON.parse(localStorage.getItem('chatgpt_snippets.snippets')) || []

    const migrations = [
      snippetsV0 => snippetsV0.map((content) => ({
        id: Date.now(),
        name: content,
        content
      })),
      snippetsV1 => snippetsV1.map((snippetItemV1) => ({
        id: snippetItemV1.id,
        label: snippetItemV1.name,
        content: snippetItemV1.content,
        actionType: SNIPPET_ACTION_TYPE.REPLACE,
      })),
    ]
    const requiredMigrations = migrations.slice(savedSnippetsVersionIndex)

    const migratedSnippets = requiredMigrations.reduce((acc, migration) => {
      return migration(acc)
    }, savedSnippets)

    localStorage.setItem('chatgpt_snippets.version', migrations.length)
    localStorage.setItem('chatgpt_snippets.snippets', JSON.stringify(migratedSnippets))

    return migratedSnippets
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

function addSnippet() {
  const snippetFormData = Object.fromEntries(Array.from(new FormData(snippetFormEl).entries()));
  const actionType = snippetFormData['actionType'] === 'append'
    ? SNIPPET_ACTION_TYPE.APPEND
    : SNIPPET_ACTION_TYPE.REPLACE

  const newSnippet = {
    id: Date.now(),
    label: snippetFormData['label'],
    content: chatGPTPromptFieldEl.value,
    actionType,
  }

  const savedSnippets = getSavedSnippets();
  savedSnippets.push(newSnippet);
  saveSnippets(savedSnippets);
  injectSnippetBtn(newSnippet);
  showNotification(`Snippet saved: "${newSnippet.label}"`)
}

function showNotification(text) {
  notificationEl.innerText = text
  setTimeout(() => {
    notificationEl.innerText = ''
  }, 4000)
}

function createLayoutFromString(template) {
  const div = document.createElement('div')
  div.innerHTML = template

  return div.children[0]
}

function debounce(f, ms) {
  let timeoutId;

  return [
    (...args) => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(
        () => f(...args),
        ms
      );
    },
    () => clearTimeout(timeoutId)
  ];
}

document.head.append(createLayoutFromString(`
  <style>
    .mf-nofication {
      opacity: 0;
      pointer-events: none;
      position: absolute;
    }

    .mf-save-snippet-btn {
      position: absolute;
      right: 50px;
      bottom: 16px;
      height: 24px;
      background: ${COLORS.PRIMARY};
      border-radius: 6px;
      width: 24px;
      padding: 3px;
      transition: background .2s;
    }

    .mf-save-snippet-btn:hover {
      cursor: pointer;
      background: rgb(91 101 224);
      transition: background .2s;
    }

    .mf-snippets {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 8px;
      max-height: 90px;
      overflow: auto;
    }

    .mf-snippet {
      position: relative;
      overflow: hidden;
      background: ${COLORS.PRIMARY};
      border-radius: 6px;
      padding-right: 20px;
      display: flex;
    }

    .mf-snippet__append-action {
      background: ${COLORS.APPEND_ACTION_FEATURE};
    }

    .mf-snippet__label {
      font-size: 11px;
      max-width: 220px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      padding: 3px 5px;
    }

    .mf-snippet__label:hover {
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

    .mf-snippet-form-popup {
      position: absolute;
      bottom: 6px;
      right: 74px;
      padding-right: 8px;
      width: 200px;
      height: 44px;
      transition: opacity .15s;
      color: #000;
      opacity: 0;
      pointer-events: none;
    }

    .mf-snippet-form-popup__form {
      background: #fff;
      border-radius: 6px;
      height: 100%;
      overflow: hidden;
      position: relative;
    }

    .mf-snippet-form-popup-arrow {
      position: absolute;
      width: 0;
      height: 0;
      margin-left: 0;
      bottom: 0;
      top: calc(50% - 5px);
      right: 3px;
      box-sizing: border-box;
      border: 5px solid #fff;
      border-color: #fff #fff transparent transparent;
      transform-origin: 5px 5px;
      transform: rotate(45deg);
    }

    .mf-snippet-form-popup-steps {
      height: 100%;
      transition: transform .2s;
    }

    .mf-snippet-form-popup-steps__item {
      height: 100%;
      overflow: hidden;
    }

    .mf-snippet-form-popup-steps__item-title {
      position: absolute;
      left: 8px;
      font-size: 11px;
      pointer-events: none;
    }

    .mf-snippet-form-label-step__input {
      width: 100%;
      padding: 10px;
      background: transparent;
      height: 100%;
      font-size: 14px;
      color: #000;
      border: 0;
    }

    .mf-new-snippet-popup-action-type-step {
      position: relative;
    }

    .mf-new-snippet-popup-action-type-step__content {
      padding: 14px 10px 0 10px;
      height: 100%;
    }

    .mf-radio {
      font-size: 12px;
      display: flex;
      line-height: 14px;
      padding-left: 18px;
      position: relative;
    }

    .mf-radio input {
      position: absolute;
      opacity: 0;
      top: -2px;
    }

    .mf-radio input:checked + .mf-radio__circle .mf-radio__dot {
      background: ${COLORS.PRIMARY};
    }

    .mf-radio input:focus + .mf-radio__circle {
      box-shadow: 0 0 0 2px rgba(0,123,255,0.5);;
    }

    .mf-radio__circle {
      position: absolute;
      width: 12px;
      height: 12px;
      left: 0;
      top: 1px;
      border: 1px solid ${COLORS.PRIMARY};
      border-radius: 50%;
      padding: 2px;
      transition: border-color .2s;
    }

    .mf-radio__dot {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: transparent;
      transition: background .2s;
    }

    .mf-radio.mf-action-type-append-radio input:checked + .mf-radio__circle {
      border-color: ${COLORS.APPEND_ACTION_FEATURE};
    }

    .mf-radio.mf-action-type-append-radio input:checked + .mf-radio__circle .mf-radio__dot {
      background: ${COLORS.APPEND_ACTION_FEATURE};
    }
  </style>
`))