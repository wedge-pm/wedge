#!/usr/bin/env node

import React from 'react';
import {render} from 'ink';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import App from './deleteme.js';
import * as modelIndex from './model-index.js';
import ModelList from './components/ModelList.js';
import {serveModel} from './model-serving.js';
import ChatUI from './components/ChatUI.js';
import ModelInstaller from './components/ModelInstaller.js';
import {removeModel} from './model-management.js';

yargs(hideBin(process.argv))
	.scriptName('wedge')
	.command(
		'search <query>',
		'Search for a model',
		yargs =>
			yargs.positional('query', {
				type: 'string',
				describe: 'Search query',
			}),
		async argv => {
			await modelIndex.refreshIndex();
			render(<ModelList models={modelIndex.queryIndex(argv.query)} />);
		},
	)
	.command(
		'list',
		'List all available models',
		yargs =>
			yargs.option('local', {
				type: 'boolean',
				describe: 'List local models only',
			}),
		async _ => {
			await modelIndex.refreshIndex();
			render(<ModelList models={modelIndex.queryIndex()} />);
		},
	)
	.command(
		'install <model>',
		'Install a model by name',
		yargs =>
			yargs.positional('model', {
				type: 'string',
				describe: 'Model Name',
			}),
		async argv => {
			await modelIndex.refreshIndex();
			const model = modelIndex.findExact(argv.model!);
			if (!model) {
				console.error(
					`Model with name ${argv.model!} not found, try 'wedge search <query>' instead.`,
				);
			} else {
				render(<ModelInstaller model={model} />);
			}
		},
	)
	.command(
		'uninstall <model>',
		'Uninstall a model that is currently installed',
		yargs =>
			yargs.positional('model', {
				type: 'string',
				describe: 'Model Name',
			}),
		async argv => {
			removeModel(argv.model!);
			console.log(`Model ${argv.model!} uninstalled.`);
		},
	)
	.command(
		'serve <model>',
		'Serve model via REST API',
		yargs =>
			yargs.positional('model', {
				type: 'string',
				describe: 'Model Name',
			}),
		async argv => {
			const serverProcess = await serveModel(argv.model!);
			const {stderr} = await serverProcess;
			if (stderr) {
				console.error(stderr);
			}
		},
	)
	.command(
		'run <model>',
		'Run model via stdin/stdout',
		yargs =>
			yargs.positional('model', {
				type: 'string',
				describe: 'Model Name',
			}),
		argv => {
			render(<App name={argv.model} />);
		},
	)
	.command(
		'chat <model>',
		'Launch interactive chat with model',
		yargs =>
			yargs.positional('model', {
				type: 'string',
				describe: 'Model Name',
			}),
		argv => {
			render(<ChatUI modelName={argv.model!} />);
		},
	)
	.recommendCommands()
	.parse();
