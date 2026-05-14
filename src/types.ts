export const SNIPPET_ACTION_TYPE = {
  REPLACE: 'replace',
  APPEND: 'append',
} as const;

export type SnippetActionType = typeof SNIPPET_ACTION_TYPE[keyof typeof SNIPPET_ACTION_TYPE];

export interface Snippet {
  id: number;
  label: string;
  content: string;
  actionType: SnippetActionType;
}
