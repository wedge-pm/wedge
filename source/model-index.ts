import * as csv from 'csv/sync';
import {readFileSync} from 'fs';
import * as path from 'path';
import * as fs from 'fs';
import {
	INDEX_DIRECTORY,
	MODELS_DIRECTORY,
	PACKAGE_INDEX_URL,
} from './constants.js';
import {download} from './path-resolver.js';

const INDEX_PATH = path.join(INDEX_DIRECTORY, 'wedge-index.csv');

export interface IndexRow {
	name: string;
	description: string;
	location: string;
	size: string;
	language: string;
}

export async function refreshIndex() {
	await download(PACKAGE_INDEX_URL, INDEX_DIRECTORY);
}

export function queryIndex(
	queryString?: string,
): (IndexRow & {installed: boolean})[] {
	const csv_text = readFileSync(INDEX_PATH, 'utf-8');
	let index = csv.parse(csv_text, {
		columns: true,
	});
	if (queryString) {
		index = index.filter(
			(row: IndexRow) =>
				row.name.toLowerCase().includes(queryString.toLowerCase()) ||
				row.description.toLowerCase().includes(queryString.toLowerCase()),
		);
	}
	return index.map((row: IndexRow) => ({
		...row,
		installed: !!fs.existsSync(path.join(MODELS_DIRECTORY, row.name)),
	}));
}

export function findExact(name: string): IndexRow | undefined {
	const csv_text = readFileSync(INDEX_PATH, 'utf-8');
	const index: any[] = csv.parse(csv_text, {
		columns: true,
	});

	return index.find(
		(row: IndexRow) => row.name.toLowerCase() === name.toLowerCase(),
	);
}
