import React from 'react';
import {Box, Text, useApp, useInput} from 'ink';
import {type IndexRow} from '../model-index.js';
import ModelInstaller from './ModelInstaller.js';

interface ModelListProps {
	models: IndexRow[];
}

export default function ModelList({models}: ModelListProps) {
	const [selectedModel, setSelectedModel] = React.useState(0);
	const [installingModel, setInstallingModel] = React.useState<
		IndexRow | undefined
	>(undefined);

	const {exit} = useApp();
	useInput((input, key) => {
		if (!installingModel) {
			if (key.upArrow) {
				setSelectedModel(Math.max(0, selectedModel - 1));
			}
			if (key.downArrow) {
				setSelectedModel(Math.min(models.length - 1, selectedModel + 1));
			}

			if (key.return) {
				setInstallingModel(models[selectedModel]);
			}

			if (key.escape || input === 'q') {
				exit();
			}
		}
	});

	if (installingModel) {
		return <ModelInstaller model={installingModel} />;
	}

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text dimColor inverse>
					Press 'Enter' / 'Return' to install, or 'q' / 'Esc' to exit.
				</Text>
			</Box>
			<Box flexDirection="column" flexGrow={1}>
				{models.map((model, i) => (
					<Text key={model.name} color={''} inverse={i === selectedModel}>
						<Text color={'green'}>{model.name}</Text> - {model.description}{' '}
					</Text>
				))}
			</Box>
			<Box marginTop={1}>
				<Text dimColor inverse>
					Press 'Enter' / 'Return' to install, or 'q' / 'Esc' to exit.
				</Text>
			</Box>
		</Box>
	);
}
