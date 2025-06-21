import { writable } from 'svelte/store';
import themes from '../../themes.json';
import type { Theme } from '../interfaces/theme';

const defaultColorscheme: Theme = themes.find((t) => t.name === 'HackTheBox')!;

// Validar si un objeto es un Theme válido
function isValidTheme(obj: any): obj is Theme {
  return obj && typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    typeof obj.background === 'string' &&
    typeof obj.foreground === 'string' &&
    typeof obj.cursorColor === 'string' &&
    ['black', 'red', 'green', 'yellow', 'blue', 'purple', 'cyan', 'white',
     'brightBlack', 'brightRed', 'brightGreen', 'brightYellow',
     'brightBlue', 'brightPurple', 'brightCyan', 'brightWhite']
     .every(color => typeof obj[color] === 'string');
}

let initialTheme: Theme;

try {
  const stored = localStorage.getItem('colorscheme');
  const parsed = stored ? JSON.parse(stored) : null;
  initialTheme = isValidTheme(parsed) ? parsed : defaultColorscheme;
} catch (e) {
  console.warn("Invalid theme found in localStorage. Resetting to default.");
  initialTheme = defaultColorscheme;
}

export const theme = writable<Theme>(initialTheme);

theme.subscribe((value) => {
  localStorage.setItem('colorscheme', JSON.stringify(value));
});
