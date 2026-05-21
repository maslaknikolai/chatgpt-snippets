import { atom } from 'jotai';
import { Snippet } from './types';

export const snippetsAtom = atom<Snippet[]>([]);

export const fieldAtom = atom<HTMLElement | null>(null);
