export function createLayoutFromString(template: string): HTMLElement {
  const div = document.createElement('div');
  div.innerHTML = template;
  return div.children[0] as HTMLElement;
}

export function debounce(f: (...args: any[]) => void, ms: number): [() => void, () => void] {
  let timeoutId: ReturnType<typeof setTimeout>;

  return [
    (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => f(...args), ms);
    },
    () => clearTimeout(timeoutId),
  ];
}
