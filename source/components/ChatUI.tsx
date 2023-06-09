import {Box, Text, useApp, useInput} from 'ink';
import React from 'react';
import {useEffect, useState} from 'react';
import {serveModel} from '../model-serving.js';
import InteractiveInput from './InteractiveInput.js';

interface ChatUIProps {
	modelName: string;
}

export default function ChatUI({modelName}: ChatUIProps) {
	const [chatHistory, setChatHistory] = useState<
		{color: string; text: string}[]
	>([]);
	const [serverReady, setServerReady] = useState(false);
	const [serverWorking, setServerWorking] = useState(false);
	const {exit} = useApp();

	useEffect(() => {
		serveModel(modelName);
		setServerReady(true);
	}, [modelName]);

	useInput((_input, key) => {
		if (key.escape) {
			exit();
			process.exit(0);
		}
	});

	async function handleNewInput(entry: string) {
		setChatHistory(ch => [...ch, {color: 'green', text: entry}]);
		setServerWorking(true);
		const resp = await fetch('http://localhost:9801/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				message: entry,
			}),
		});
		const json: any = await resp.json();
		setChatHistory(ch => [...ch, {color: 'yellow', text: json.message}]);
		setServerWorking(false);
	}

	if (!serverReady) {
		return <Text>Loading...</Text>;
	}

	return (
		<>
			<Box margin={1} marginBottom={0} paddingX={1} borderStyle={'single'}>
				<InteractiveInput
					history={chatHistory}
					onAddInputValue={handleNewInput}
					working={serverWorking}
				/>
			</Box>
			<Box marginX={1} marginBottom={1}>
				<Text dimColor inverse>
					{" Press 'Esc' to exit. "}
				</Text>
			</Box>
		</>
	);
}
