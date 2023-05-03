import persistentStorage from 'node-persist';
import {DATA_DIRECTORY} from './constants.js';

await persistentStorage.init({
	dir: DATA_DIRECTORY,
});

export async function persistModelEnvVars(modelName: string, envVars: any) {
	await persistentStorage.setItem(modelName, envVars);
}

export async function persistAgentEnvVars(
	modelName: string,
	agentName: string,
	envVars: any,
) {
	await persistentStorage.setItem(modelName + '::' + agentName, envVars);
}

export async function fetchModelEnvVars(modelName: string) {
	return await persistentStorage.getItem(modelName);
}

export async function fetchAgentEnvVars(modelName: string, agentName: string) {
	return await persistentStorage.getItem(modelName + '::' + agentName);
}

export async function fetchAllEnvVars(modelName: string, agentName: string) {
	const modelEnvVars = await fetchModelEnvVars(modelName);
	const agentEnvVars = await fetchAgentEnvVars(modelName, agentName);
	return {...modelEnvVars, ...agentEnvVars};
}
