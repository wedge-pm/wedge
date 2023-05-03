import {execaCommand} from 'execa';
import * as path from 'path';
import * as fs from 'fs';
import {WedgeConfig} from './config-schemas.js';
import {MODELS_DIRECTORY} from './constants.js';
import {fetchModelEnvVars} from './env-vars.js';

export async function serveModel(modelName: string) {
	const modelDir = path.join(MODELS_DIRECTORY, modelName);
	// Throw error if model hasn't been downloaded yet
	if (!fs.existsSync(modelDir)) {
		throw new Error(`Model ${modelName} has not been downloaded yet`);
	}

	// Load model config
	const configPath = path.join(modelDir, 'wedge.json');
	const config: WedgeConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

	if (!config.serve) {
		throw new Error(`Model ${modelName} does not have a serve command`);
	}

	const modelEnv = await fetchModelEnvVars(modelName);

	// Run model serving command. Model should serve a /chat endpoint on localhost:9801
	return execaCommand(config.serve, {
		env: modelEnv,
		cwd: modelDir,
	});
}
