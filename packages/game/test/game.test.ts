import { describe, expect, it } from 'vitest';
import {
  activeMs,
  canSubmit,
  createGame,
  dailyIndex,
  dailyLevel,
  dateKey,
  DEFAULT_PENALTIES,
  emptyStats,
  enterDigit,
  eraseCell,
  GameState,
  isWrong,
  pause,
  pickPuzzle,
  recordGame,
  requestHint,
  resume,
  showErrors,
  submit,
  toggleNote,
  totalMs,
} from '../src';

const PUZZLE = '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
const SOLUTION = '534678912672195348198342567859761423426853791713924856961537284287419635345286179';

const newGame = (autoCheck: boolean, now = 0): GameState =>
  createGame({
    puzzleId: '3-0001',
    puzzle: PUZZLE,
    solution: SOLUTION,
    level: 3,
    slot: 'level-3',
    autoCheck,
    now,
  });

/** Fyller inn alle tomme ruter med fasiten, unntatt `skip`. */
function fillAll(s: GameState, now: number, skip: number[] = []): GameState {
  let g = s;
  for (let c = 0; c < 81; c++) {
    if (PUZZLE[c] === '0' && !skip.includes(c)) g = enterDigit(g, c, Number(SOLUTION[c]), now).state;
  }
  return g;
}

describe('klokke', () => {
  it('teller bare aktiv tid, og pause stopper klokken', () => {
    let g = newGame(true, 1000);
    expect(activeMs(g, 6000)).toBe(5000);
    g = pause(g, 6000);
    expect(activeMs(g, 60_000)).toBe(5000);
    g = resume(g, 60_000);
    expect(activeMs(g, 61_000)).toBe(6000);
  });

  it('legger straff til total tid', () => {
    let g = newGame(true, 0);
    g = enterDigit(g, 2, 1, 0).state; // feil (riktig er 4)
    expect(totalMs(g, 10_000)).toBe(10_000 + DEFAULT_PENALTIES.errorMs);
  });
});

describe('utgangstall', () => {
  it('kan ikke endres eller slettes', () => {
    const g = newGame(true);
    expect(enterDigit(g, 0, 9, 0).state).toBe(g);
    expect(eraseCell(g, 0)).toBe(g);
    expect(toggleNote(g, 0, 1)).toBe(g);
  });
});

describe('notater', () => {
  it('slås av og på i tomme ruter', () => {
    let g = newGame(true);
    g = toggleNote(g, 2, 4);
    g = toggleNote(g, 2, 1);
    expect(g.notes[2]).toBe(0b1001);
    g = toggleNote(g, 2, 4);
    expect(g.notes[2]).toBe(0b0001);
  });

  it('ryddes i samme rad, kolonne og boks når et tall settes inn', () => {
    let g = newGame(false);
    g = toggleNote(g, 3, 4); // rad 1
    g = toggleNote(g, 18, 4); // boks 1
    g = toggleNote(g, 74, 4); // kolonne 3
    g = toggleNote(g, 62, 4); // ser ikke rute 2
    g = toggleNote(g, 3, 6);
    g = enterDigit(g, 2, 4, 0).state;
    expect(g.notes[3]).toBe(1 << 5); // bare 6 igjen
    expect(g.notes[18]).toBe(0);
    expect(g.notes[74]).toBe(0);
    expect(g.notes[62]).toBe(1 << 3);
  });

  it('kan ikke settes i en rute med tall', () => {
    let g = newGame(false);
    g = enterDigit(g, 2, 4, 0).state;
    expect(toggleNote(g, 2, 1)).toBe(g);
  });
});

describe('auto-sjekk på', () => {
  it('gir straff for hver feil, men ikke for samme tall to ganger', () => {
    let g = newGame(true);
    const r = enterDigit(g, 2, 1, 0);
    expect(r.mistake).toBe(true);
    g = enterDigit(r.state, 2, 1, 0).state;
    g = enterDigit(g, 2, 2, 0).state;
    expect(g.errorCount).toBe(2);
    expect(g.penaltyMs).toBe(2 * DEFAULT_PENALTIES.errorMs);
    expect(isWrong(g, 2)).toBe(true);
    expect(showErrors(g)).toBe(true);
  });

  it('avslutter automatisk når siste rute er riktig, og stopper klokken', () => {
    let g = fillAll(newGame(true, 0), 0, [78]);
    expect(g.status).toBe('playing');
    g = enterDigit(g, 78, 1, 42_000).state;
    expect(g.status).toBe('won');
    expect(g.finishedAt).toBe(42_000);
    expect(activeMs(g, 99_000)).toBe(42_000);
  });

  it('har ingen «Lever brett»', () => {
    expect(canSubmit(fillAll(newGame(true), 0, [78]))).toBe(false);
  });
});

describe('auto-sjekk av', () => {
  it('gir ingen straff og viser ikke feil underveis', () => {
    const r = enterDigit(newGame(false), 2, 1, 0);
    expect(r.mistake).toBe(false);
    expect(r.state.penaltyMs).toBe(0);
    expect(showErrors(r.state)).toBe(false);
  });

  it('kan bare leveres når brettet er fullt', () => {
    const g = fillAll(newGame(false), 0, [78]);
    expect(canSubmit(g)).toBe(false);
    expect(submit(g, 0)).toBe(g);
  });

  it('vinner ved riktig levering og avslutter ikke av seg selv', () => {
    let g = fillAll(newGame(false), 0);
    expect(g.status).toBe('playing');
    g = submit(g, 5000);
    expect(g.status).toBe('won');
  });

  it('taper ved feil levering og viser feilene', () => {
    let g = fillAll(newGame(false), 0, [2, 3]);
    g = enterDigit(g, 2, 6, 0).state; // riktig: 4
    g = enterDigit(g, 3, 4, 0).state; // riktig: 6
    g = submit(g, 5000);
    expect(g.status).toBe('lost');
    expect(g.wrongCells).toEqual([2, 3]);
    expect(showErrors(g)).toBe(true);
    expect(enterDigit(g, 2, 4, 6000).state).toBe(g);
  });
});

describe('tips', () => {
  it('gir straff og et logisk steg', () => {
    const r = requestHint(newGame(true));
    expect(r.hint.kind).toBe('step');
    expect(r.state.hintCount).toBe(1);
    expect(r.state.penaltyMs).toBe(DEFAULT_PENALTIES.hintMs);
  });

  it('sier bare at det finnes feil, og gir fortsatt straff', () => {
    const g = enterDigit(newGame(false), 2, 1, 0).state;
    const r = requestHint(g);
    expect(r.hint).toEqual({ kind: 'error' });
    expect(r.state.penaltyMs).toBe(DEFAULT_PENALTIES.hintMs);
  });
});

describe('statistikk', () => {
  it('holder rekorder med og uten auto-sjekk adskilt', () => {
    let stats = emptyStats();
    const a = fillAll(newGame(true, 0), 0, [78]);
    const won = enterDigit(a, 78, 1, 100_000).state;
    let r = recordGame(stats, won);
    expect(r.newRecord).toBe(true);
    expect(r.stats[3].autoCheck.bestMs).toBe(100_000);
    expect(r.stats[3].noAutoCheck.bestMs).toBeNull();
    stats = r.stats;

    const b = submit(fillAll(newGame(false, 0), 0), 200_000);
    r = recordGame(stats, b);
    expect(r.newRecord).toBe(true);
    expect(r.stats[3].noAutoCheck.bestMs).toBe(200_000);
    expect(r.stats[3].autoCheck.bestMs).toBe(100_000);
  });

  it('teller tap, tips og feil', () => {
    let g = fillAll(newGame(false, 0), 0, [2]);
    g = requestHint(g).state;
    g = enterDigit(g, 2, 1, 0).state;
    g = submit(g, 1000);
    const r = recordGame(emptyStats(), g);
    expect(r.stats[3].noAutoCheck.lost).toBe(1);
    expect(r.stats[3].hints).toBe(1);
    expect(r.stats[3].errors).toBe(1);
    expect(r.newRecord).toBe(false);
  });
});

describe('dagens brett', () => {
  it('bruker riktig nivå per ukedag', () => {
    expect(dailyLevel('2026-11-16')).toBe(1); // mandag
    expect(dailyLevel('2026-11-21')).toBe(5); // lørdag
    expect(dailyLevel('2026-11-22')).toBe(4); // søndag
  });

  it('gir samme brett for samme dato og ulike brett for ulike datoer', () => {
    expect(dailyIndex('2026-11-17', 1000)).toBe(dailyIndex('2026-11-17', 1000));
    const many = new Set(Array.from({ length: 30 }, (_, i) => dailyIndex(`2026-12-${i + 1}`, 1000)));
    expect(many.size).toBeGreaterThan(25);
  });

  it('lager datonøkkel fra lokal dato', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('valg av brett', () => {
  it('velger brett som ikke er spilt', () => {
    const bank = [1, 2, 3].map((i) => ({ id: `1-000${i}`, puzzle: '', solution: '' }));
    expect(pickPuzzle(bank, ['1-0001', '1-0002']).id).toBe('1-0003');
    expect(bank.map((b) => b.id)).toContain(pickPuzzle(bank, bank.map((b) => b.id)).id);
  });
});
