import { injectSnippets } from './snippetsList';
// import { injectSnippetFormPopup } from './snippetForm';
import { injectStyles } from './styles';

injectStyles();

function init() {
  const foundChatGPTPromptField = document.getElementById('prompt-textarea');
  const isSnippetsWrapperInjected = !!document.querySelector('.mf-snippets');

  if (!foundChatGPTPromptField || isSnippetsWrapperInjected) {
    return;
  }

  injectSnippets(foundChatGPTPromptField);
//   injectSnippetFormPopup(foundChatGPTPromptField);
}

setInterval(init, 1000);
