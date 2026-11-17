/**
 * Sudoku-brettet: klassisk rutenett med tynne linjer mellom ruter, tykke rundt
 * hver 3×3-boks og avrundet ytterkant.
 */
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { boxOf, colOf, rowOf } from '../../../packages/engine/src';
import { GameState, isGiven, isWrong, showErrors } from '../../../packages/game/src';
import { Colors } from '../theme';

interface Props {
  game: GameState;
  selected: number | null;
  /** Ruter som er del av mønsteret i et tips. */
  hintCells: number[];
  /** Tallet som er i fokus: like tall og notater med tallet utheves. */
  focusDigit: number | null;
  size: number;
  colors: Colors;
  onSelect: (cell: number) => void;
}

const OUTER = 2;
const THICK = 2;
const THIN = StyleSheet.hairlineWidth > 0.5 ? 0.5 : 1;

function BoardImpl({ game, selected, hintCells, focusDigit, size, colors, onSelect }: Props) {
  const cellSize = (size - OUTER * 2) / 9;
  const errorsVisible = showErrors(game);
  const hintSet = new Set(hintCells);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderWidth: OUTER,
        borderColor: colors.lineThick,
        borderRadius: 12,
        overflow: 'hidden',
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: colors.cell,
      }}
      accessibilityRole="grid"
    >
      {game.values.map((value, cell) => {
        const r = rowOf(cell);
        const c = colOf(cell);
        let bg = colors.cell;
        if (selected !== null) {
          const sameArea =
            r === rowOf(selected) || c === colOf(selected) || boxOf(cell) === boxOf(selected);
          if (sameArea) bg = colors.area;
        }
        if (focusDigit && value === focusDigit) bg = colors.same;
        if (hintSet.has(cell)) bg = colors.hintBg;
        const wrong = errorsVisible && isWrong(game, cell);
        if (wrong) bg = colors.errorBg;
        if (cell === selected) bg = colors.selected;

        const given = isGiven(game, cell);
        const color = wrong ? colors.error : given ? colors.given : colors.user;
        const notes = game.notes[cell];

        return (
          <Pressable
            key={cell}
            onPress={() => onSelect(cell)}
            accessibilityLabel={`rad ${r + 1} kolonne ${c + 1}${value ? ` ${value}` : ''}`}
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: bg,
              alignItems: 'center',
              justifyContent: 'center',
              borderRightWidth: c === 8 ? 0 : c % 3 === 2 ? THICK : THIN,
              borderBottomWidth: r === 8 ? 0 : r % 3 === 2 ? THICK : THIN,
              borderRightColor: c % 3 === 2 ? colors.lineThick : colors.lineThin,
              borderBottomColor: r % 3 === 2 ? colors.lineThick : colors.lineThin,
            }}
          >
            {value ? (
              <Text
                style={{
                  fontSize: cellSize * 0.55,
                  color,
                  fontWeight: given ? '500' : '400',
                }}
              >
                {value}
              </Text>
            ) : notes ? (
              <View style={[styles.notes, { width: cellSize - 2, height: cellSize - 2 }]}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                  <View
                    key={d}
                    style={{
                      width: (cellSize - 2) / 3,
                      height: (cellSize - 2) / 3,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {notes & (1 << (d - 1)) ? (
                      d === focusDigit ? (
                        // Notat med tallet i fokus: utheves med farget bakgrunn og fet skrift.
                        <View
                          style={{
                            width: (cellSize - 2) / 3 - 1,
                            height: (cellSize - 2) / 3 - 1,
                            borderRadius: cellSize / 6,
                            backgroundColor: colors.same,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: cellSize * 0.27,
                              lineHeight: cellSize * 0.3,
                              color: colors.user,
                              fontWeight: '700',
                            }}
                          >
                            {d}
                          </Text>
                        </View>
                      ) : (
                        <Text style={{ fontSize: cellSize * 0.27, lineHeight: cellSize * 0.3, color: colors.note }}>
                          {d}
                        </Text>
                      )
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  notes: { flexDirection: 'row', flexWrap: 'wrap' },
});

export const Board = memo(BoardImpl);
