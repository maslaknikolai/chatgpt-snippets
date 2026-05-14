import { Snippet, SNIPPET_ACTION_TYPE } from './types';

export function getSavedSnippets(): Snippet[] {
  try {
    const savedSnippetsVersionIndex = Number(localStorage.getItem('chatgpt_snippets.version') || 0);
    const savedSnippets = JSON.parse(localStorage.getItem('chatgpt_snippets.snippets') || '[]');

    const migrations: Array<(snippets: any[]) => any[]> = [
      snippetsV0 => snippetsV0.map((content: string) => ({
        id: Date.now(),
        name: content,
        content,
      })),
      snippetsV1 => snippetsV1.map((snippetItemV1: { id: number; name: string; content: string }) => ({
        id: snippetItemV1.id,
        label: snippetItemV1.name,
        content: snippetItemV1.content,
        actionType: SNIPPET_ACTION_TYPE.REPLACE,
      })),
    ];

    const requiredMigrations = migrations.slice(savedSnippetsVersionIndex);
    const migratedSnippets: Snippet[] = requiredMigrations.reduce((acc, migration) => migration(acc), savedSnippets);

    localStorage.setItem('chatgpt_snippets.version', String(migrations.length));
    localStorage.setItem('chatgpt_snippets.snippets', JSON.stringify(migratedSnippets));

    return migratedSnippets;
  } catch {
    return [];
  }
}

export function saveSnippets(savingSnippets: Snippet[]): void {
  localStorage.setItem('chatgpt_snippets.snippets', JSON.stringify(savingSnippets));
}
