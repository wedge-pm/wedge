import React from 'react';
import {Text} from 'ink';

interface ProgressBarProps {
	percent: number;
	columns?: number;
	left?: number;
	right?: number;
	character?: string;
	rightPad?: boolean;
	color?: string;
}

export default function ProgressBar({
	percent = 1,
	columns = 0,
	left = 0,
	right = 0,
	character = '▆',
	rightPad = false,
	color,
}: ProgressBarProps) {
	const screen = columns || process.stdout.columns || 80;
	const space = screen - right - left - 2;
	const max = Math.min(Math.floor(space * percent), space);
	const chars = character.repeat(max);
	const progressString = !rightPad ? chars : chars + ' '.repeat(space - max);

	return (
		<Text color={color}>
			<Text dimColor>▐</Text>
			{progressString}
			<Text dimColor>▌</Text>
		</Text>
	);
}
