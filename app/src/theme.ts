/**
 * Farger for stil A (ren og minimalistisk, blå aksent) i lys og mørk modus.
 * Verdiene er hentet fra de godkjente skissene.
 */
import { useColorScheme } from 'react-native';

export interface Colors {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accentBg: string;
  onAccent: string;
  border: string;
  // brett
  cell: string;
  lineThin: string;
  lineThick: string;
  area: string;
  same: string;
  selected: string;
  given: string;
  user: string;
  error: string;
  errorBg: string;
  note: string;
  hintBg: string;
  // tastatur
  padBg: string;
  padText: string;
  notePadBg: string;
  notePadBorder: string;
  notePadText: string;
  success: string;
}

const light: Colors = {
  bg: '#FFFFFF',
  surface: '#F1EFE8',
  text: '#2C2C2A',
  muted: '#5F5E5A',
  accent: '#185FA5',
  accentBg: '#E6F1FB',
  onAccent: '#FFFFFF',
  border: '#D3D1C7',
  cell: '#FFFFFF',
  lineThin: '#D3D1C7',
  lineThick: '#444441',
  area: '#E6F1FB',
  same: '#B5D4F4',
  selected: '#85B7EB',
  given: '#2C2C2A',
  user: '#185FA5',
  error: '#A32D2D',
  errorBg: '#FCEBEB',
  note: '#5F5E5A',
  hintBg: '#FAEEDA',
  padBg: '#E6F1FB',
  padText: '#185FA5',
  notePadBg: '#FFFFFF',
  notePadBorder: '#B4B2A9',
  notePadText: '#5F5E5A',
  success: '#3B6D11',
};

const dark: Colors = {
  bg: '#2C2C2A',
  surface: '#444441',
  text: '#F1EFE8',
  muted: '#B4B2A9',
  accent: '#85B7EB',
  accentBg: '#0C447C',
  onAccent: '#042C53',
  border: '#5F5E5A',
  cell: '#383836',
  lineThin: '#5F5E5A',
  lineThick: '#B4B2A9',
  area: '#042C53',
  same: '#0C447C',
  selected: '#185FA5',
  given: '#F1EFE8',
  user: '#85B7EB',
  error: '#F09595',
  errorBg: '#501313',
  note: '#B4B2A9',
  hintBg: '#633806',
  padBg: '#0C447C',
  padText: '#E6F1FB',
  notePadBg: '#2C2C2A',
  notePadBorder: '#5F5E5A',
  notePadText: '#B4B2A9',
  success: '#97C459',
};

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}
