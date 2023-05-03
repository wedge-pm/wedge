import path from 'path';
import os from 'os';
import fs from 'fs';

export const WEDGE_DIRECTORY = path.join(os.homedir(), '.wedge');
export const MODELS_DIRECTORY = path.join(WEDGE_DIRECTORY, 'models');
export const WEIGHTS_DIRECTORY = path.join(WEDGE_DIRECTORY, 'weights');
export const INDEX_DIRECTORY = path.join(WEDGE_DIRECTORY, 'index');
export const DATA_DIRECTORY = path.join(WEDGE_DIRECTORY, 'data');

fs.mkdirSync(MODELS_DIRECTORY, {recursive: true});
fs.mkdirSync(WEIGHTS_DIRECTORY, {recursive: true});
fs.mkdirSync(INDEX_DIRECTORY, {recursive: true});
fs.mkdirSync(DATA_DIRECTORY, {recursive: true});
