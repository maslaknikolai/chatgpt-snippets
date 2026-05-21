import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { App } from './App';
import styles from './app.css?inline';

export function injectSnippets(field: HTMLElement): void {
  const threadBottomContainer = field.closest('#thread-bottom-container');

  const hostEl = document.createElement('div');
  threadBottomContainer!.prepend(hostEl);

  const shadow = hostEl.attachShadow({ mode: 'open' });

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  shadow.appendChild(styleEl);

  const mountEl = document.createElement('div');
  shadow.appendChild(mountEl);

  createRoot(mountEl).render(createElement(App, { field }));
}


