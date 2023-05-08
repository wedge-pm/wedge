import {Box, Text} from 'ink';
import TextInput from 'ink-text-input';
import React, {useState} from 'react';

interface InteractiveInputProps {
	onAddInputValue: (entry: string) => void;
	history: {
		color: string;
		text: string;
	}[];
	working?: boolean;
}

export default function InteractiveInput({
	onAddInputValue,
	history,
	working,
}: InteractiveInputProps) {
	const [currentInput, setCurrentInput] = useState('');

	return (
		<Box flexDirection="column">
			{history.map(({color, text}, i) => (
				<Text color={color} key={i}>
					{text}
				</Text>
			))}
			{working ? (
				<Text color="green">...</Text>
			) : (
				<Box>
					<Text>{'=> '}</Text>
					<TextInput
						value={currentInput}
						onChange={setCurrentInput}
						onSubmit={() => {
							onAddInputValue(currentInput);
							setCurrentInput('');
						}}
					/>
				</Box>
			)}
		</Box>
	);
}
