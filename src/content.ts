import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import styles from './app.css?inline';
import { createLayoutFromString } from './utils';

function init() {
  const foundChatGPTPromptField = document.getElementById('prompt-textarea');

  if (!foundChatGPTPromptField) {
    console.log('ChatGPT-Snippets: Cannot render');
    return;
  }

  const snippetsWrapper = document.getElementById('mf-snippets-root');

  if (snippetsWrapper) {
    console.log('ChatGPT-Snippets: Already rendered');
    return;
  }

  const threadBottomContainer = foundChatGPTPromptField.closest('#thread-bottom-container');

  if (!threadBottomContainer) {
    console.log('ChatGPT-Snippets: Cannot render');
    return;
  }

  const hostEl = createLayoutFromString(`<div id="mf-snippets-root"></div>`);
  threadBottomContainer.prepend(hostEl);

  const shadow = hostEl.attachShadow({ mode: 'open' });

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  shadow.appendChild(styleEl);

  const mountEl = document.createElement('div');
  shadow.appendChild(mountEl);

  createRoot(mountEl).render(createElement(App, {
    field: foundChatGPTPromptField
  }));
}

setInterval(init, 300);
