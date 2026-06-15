import type { JSX } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

export const Box = ({ style, ...props }: ViewProps): JSX.Element => <View style={style} {...props} />;

export const Column = ({ style, ...props }: ViewProps): JSX.Element => (
    <View style={[styles.column, style]} {...props} />
);

export const FullBox = ({ style, ...props }: ViewProps): JSX.Element => (
    <View style={[styles.full, style]} {...props} />
);

export const FullColumn = ({ style, ...props }: ViewProps): JSX.Element => (
    <View style={[styles.fullColumn, style]} {...props} />
);

export const FullRow = ({ style, ...props }: ViewProps): JSX.Element => (
    <View style={[styles.fullRow, style]} {...props} />
);

export const Row = ({ style, ...props }: ViewProps): JSX.Element => <View style={[styles.row, style]} {...props} />;

const styles = StyleSheet.create({
    column: { flexDirection: 'column' },
    full: { flex: 1 },
    fullColumn: { flex: 1, flexDirection: 'column' },
    fullRow: { flex: 1, flexDirection: 'row' },
    row: { flexDirection: 'row' },
});
