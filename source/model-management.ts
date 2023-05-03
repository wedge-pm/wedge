import {MODELS_DIRECTORY, WEIGHTS_DIRECTORY} from './constants.js';
import {download} from './path-resolver.js';
import * as path from 'path';
import * as fs from 'fs';
import {IndexRow} from './model-index.js';
import {WedgeConfig} from './config-schemas.js';
import {persistModelEnvVars} from './env-vars.js';
import {execaCommand} from 'execa';

export async function fetchModel(model: IndexRow) {
	await download(model.location, path.join(MODELS_DIRECTORY, model.name));
}

export async function setupModel(
	model: IndexRow,
	solicitOptionValue: (optionPrompt: string) => Promise<string>,
	onProgress?: (progress: number) => void,
	onStatusChange?: (status: string) => void,
) {
	const modelDir = path.join(MODELS_DIRECTORY, model.name);
	// Throw error if model hasn't been downloaded yet
	if (!fs.existsSync(modelDir)) {
		throw new Error(`Model ${model.name} has not been downloaded yet`);
	}

	// Load model config
	const configPath = path.join(modelDir, 'wedge.json');
	const config: WedgeConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

	// Get user input for model options
	const modelOptions = config.options?.model;
	let optionValues: any = {};
	if (modelOptions) {
		for (const optionName in modelOptions) {
			const option = modelOptions[optionName]!;
			optionValues[optionName] = await solicitOptionValue(option.prompt);
		}
	}

	await persistModelEnvVars(model.name, optionValues);

	// fetch model weights
	if (config.weights) {
		for (const weightPath of config.weights) {
			await download(
				weightPath,
				path.join(WEIGHTS_DIRECTORY, model.name),
				(progress: number) => {
					onProgress?.(progress);
					onStatusChange?.(
						`Downloading ${model.name} weights (${Math.floor(
							progress * 100,
						)}%)...`,
					);
				},
			);
		}
	}

	// build model flake
	if (config.flake) {
		onStatusChange?.(`Building ${model.name}...`);
		const {stderr} = await execaCommand(
			`nix --extra-experimental-features nix-command --extra-experimental-features flakes build ${config.flake}`,
			{
				cwd: modelDir,
			},
		);

		if (stderr) {
			console.error(stderr);
		}
	}

	// Run model setup
	if (config.setup) {
		onStatusChange?.(`Setting up ${model.name}...`);
		const {stderr} = await execaCommand(config.setup, {
			env: optionValues,
			cwd: modelDir,
		});

		if (stderr) {
			console.log(stderr);
		}
	}
}
