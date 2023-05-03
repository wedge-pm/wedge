import {Box, Text, useApp} from 'ink';
import React, {useEffect, useMemo} from 'react';
import {type IndexRow} from '../model-index.js';
import {fetchModel, setupModel} from '../model-management.js';
import InteractiveInput from './InteractiveInput.js';
// @ts-ignore
import ProgressBar from './ProgressBar.js';

interface ModelInstallerProps {
	model: IndexRow;
}

export default function ModelInstaller({model}: ModelInstallerProps) {
	const {exit} = useApp();
	const [progress, setProgress] = React.useState(0);
	const [status, setStatus] = React.useState('Downloading');
	const [isSuccess, setIsSuccess] = React.useState<boolean | undefined>(
		undefined,
	);
	const [hasCollectedOptions, setHasCollectedOptions] = React.useState<
		boolean | undefined
	>(undefined);
	const optionReceivedCallback = React.useRef<(option: string) => void>();
	const [modelOptionsInputHistory, setModelOptionsInputHistory] =
		React.useState<{color: string; text: string}[]>([]);

	const promptForOption = (optionPrompt: string) => {
		setHasCollectedOptions(false);
		setModelOptionsInputHistory([
			...modelOptionsInputHistory,
			{color: 'yellow', text: optionPrompt},
		]);
		return new Promise<string>(resolve => {
			optionReceivedCallback.current = resolve;
		});
	};

	const handleOptionReceived = (option: string) => {
		setModelOptionsInputHistory([
			...modelOptionsInputHistory,
			{color: 'green', text: option},
		]);
		if (optionReceivedCallback.current) {
			optionReceivedCallback.current(option);
		}
	};

	useEffect(() => {
		(async () => {
			setStatus('Fetching Model Package Definition...');
			setProgress(0);
			await fetchModel(model);
			setProgress(0.25);
			setStatus('Setting up Model...');
			await setupModel(
				model,
				promptForOption,
				progress => {
					setProgress(progress * 0.5 + 0.25);
				},
				setStatus,
			);
			setHasCollectedOptions(true);
			setProgress(1);
			setStatus('Completed!');
			setIsSuccess(true);
		})();
	}, [model]);

	useEffect(() => {
		if (isSuccess) {
			exit();
		}
	}, [isSuccess]);

	const statusColor = useMemo(() => {
		if (isSuccess) {
			return 'green';
		} else if (isSuccess === false) {
			return 'red';
		} else {
			return 'yellow';
		}
	}, [isSuccess]);

	return (
		<Box flexDirection="column" marginY={1} marginX={2}>
			<ProgressBar
				color={'green'}
				percent={progress}
				left={2}
				right={2}
				rightPad
			/>
			<Box margin={1}>
				<Text color={statusColor}>{status}</Text>
			</Box>
			{hasCollectedOptions === false && (
				<InteractiveInput
					history={modelOptionsInputHistory}
					onAddInputValue={handleOptionReceived}
				/>
			)}
		</Box>
	);
}
