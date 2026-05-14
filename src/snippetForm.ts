import { SnippetActionType, SNIPPET_ACTION_TYPE } from './types';
import { ARIA_DESCRIPTIONS } from './constants';
import { createLayoutFromString, debounce } from './utils';
import { getSavedSnippets, saveSnippets } from './storage';
import { injectSnippetBtn, showNotification } from './snippetsList';

let chatGPTPromptFieldEl: HTMLElement;
let snippetFormPopupEl: HTMLElement;
let snippetFormEl: HTMLFormElement;
let labelInputFieldEl: HTMLInputElement;
let actionTypeRadios: HTMLInputElement[] = [];
let snippetFormStepsEl: HTMLElement;
let saveSnippetBtnEl: HTMLButtonElement;
let isLabelChangedByUser = false;
let stepOfSnippetForm = 1;

export function injectSnippetFormPopup(field: HTMLElement): void {
  chatGPTPromptFieldEl = field;

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
  `) as HTMLButtonElement;

  saveSnippetBtnEl.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (stepOfSnippetForm === 1) {
      tryToGoStep2();
      return;
    }

    if (stepOfSnippetForm === 2) {
      chatGPTPromptFieldEl.focus();
      addSnippet();
      resetForm();
      console.log('WIPWIP');
    //   chatGPTPromptFieldEl.value = '';
    }
  };

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
  `);

  chatGPTPromptFieldEl.parentElement!.append(snippetFormPopupEl);
  chatGPTPromptFieldEl.parentElement!.append(saveSnippetBtnEl);

  labelInputFieldEl = snippetFormPopupEl.querySelector<HTMLInputElement>('.mf-snippet-form-label-step__input')!;
  snippetFormStepsEl = snippetFormPopupEl.querySelector<HTMLElement>('.mf-snippet-form-popup-steps')!;
  snippetFormEl = snippetFormPopupEl.querySelector<HTMLFormElement>('.mf-snippet-form-popup__form')!;
  actionTypeRadios = [...snippetFormPopupEl.querySelectorAll<HTMLInputElement>('.mf-radio input')];

  const allFormFocusables = [...actionTypeRadios, labelInputFieldEl, saveSnippetBtnEl];
  const checkIfFocusInForm = () => (
    allFormFocusables.includes(document.activeElement as HTMLInputElement | HTMLButtonElement)
    || document.activeElement === saveSnippetBtnEl
  );

  const [runHideDebounce, cancelHideDebounce] = debounce(() => {
    if (checkIfFocusInForm()) {
      return;
    }

    setSnippetFormStep(1);
    snippetFormPopupEl.style.opacity = '0';
    snippetFormPopupEl.style.pointerEvents = 'none';
  }, 300);

  const show = () => {
    cancelHideDebounce();
    snippetFormPopupEl.style.opacity = '1';
    snippetFormPopupEl.style.pointerEvents = 'auto';
  };

  const showOrHideDependsOnFormFocus = () => {
    if (checkIfFocusInForm()) {
      show();
    } else {
      runHideDebounce();
    }
  };

  saveSnippetBtnEl.onmouseover = show;
  saveSnippetBtnEl.onmouseleave = runHideDebounce;
  snippetFormPopupEl.onmouseover = show;
  snippetFormPopupEl.onmouseleave = runHideDebounce;

  allFormFocusables.forEach((it) => {
    it.onfocus = showOrHideDependsOnFormFocus;
    it.onblur = showOrHideDependsOnFormFocus;
  });

  labelInputFieldEl.oninput = (e) => {
    isLabelChangedByUser = !!(e.target as HTMLInputElement).value.length;
    actualizeSaveSnippetBtnDisabledState();
  };

  labelInputFieldEl.addEventListener('focus', () => {
    setSnippetFormStep(1);
  });

  labelInputFieldEl.onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      tryToGoStep2();
    }
  };

  chatGPTPromptFieldEl.addEventListener('input', () => {
    if (isLabelChangedByUser) {
      return;
    }

    console.log('WIPWIP');

    // labelInputFieldEl.value = chatGPTPromptFieldEl.value;
    actualizeSaveSnippetBtnDisabledState();
  });
}

function tryToGoStep2(): void {
  if (!labelInputFieldEl.value.length) {
    return;
  }

  setSnippetFormStep(2);
  saveSnippetBtnEl.setAttribute('aria-label', ARIA_DESCRIPTIONS.BTN_SECOND_STEP);
  actionTypeRadios[0].focus();
}

function resetForm(): void {
  setSnippetFormStep(1);
  labelInputFieldEl.value = '';
  isLabelChangedByUser = false;
  actualizeSaveSnippetBtnDisabledState();
}

function actualizeSaveSnippetBtnDisabledState(): void {
  const isDisabled = !labelInputFieldEl.value.length;

  saveSnippetBtnEl.disabled = isDisabled;
  actionTypeRadios.forEach((it) => {
    it.disabled = isDisabled;
  });
}

function setSnippetFormStep(newStep: number): void {
  stepOfSnippetForm = newStep;
  snippetFormStepsEl.style.transform = `translateY(-${(newStep - 1) * 44}px)`;

  if (newStep === 1) {
    saveSnippetBtnEl.setAttribute('aria-label', ARIA_DESCRIPTIONS.BTN_FIRST_STEP);
    actionTypeRadios.forEach(it => it.setAttribute('tabindex', '-1'));
  } else {
    saveSnippetBtnEl.setAttribute('aria-label', ARIA_DESCRIPTIONS.BTN_SECOND_STEP);
    actionTypeRadios.forEach(it => it.removeAttribute('tabindex'));
  }
}

function addSnippet(): void {
  const snippetFormData = Object.fromEntries(Array.from(new FormData(snippetFormEl).entries()));
  const actionType: SnippetActionType = snippetFormData['actionType'] === 'append'
    ? SNIPPET_ACTION_TYPE.APPEND
    : SNIPPET_ACTION_TYPE.REPLACE;

  const newSnippet = {
    id: Date.now(),
    label: snippetFormData['label'] as string,
    // content: chatGPTPromptFieldEl.value,
    content: '',
    actionType,
  };
  console.log('WIPWIP ^^^');



  const savedSnippets = getSavedSnippets();
  savedSnippets.push(newSnippet);
  saveSnippets(savedSnippets);
  injectSnippetBtn(newSnippet);
  showNotification(`Snippet saved: "${newSnippet.label}"`);
}
