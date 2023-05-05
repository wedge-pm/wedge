import * as csv from 'csv/sync';
import {readFileSync} from 'fs';
import * as path from 'path';
import {INDEX_DIRECTORY, PACKAGE_INDEX_URL} from './constants.js';
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

export function queryIndex(queryString?: string) {
	const csv_text = readFileSync(INDEX_PATH, 'utf-8');
	const index = csv.parse(csv_text, {
		columns: true,
	});
	if (!queryString) {
		return index;
	}
	return index.filter(
		(row: IndexRow) =>
			row.name.toLowerCase().includes(queryString.toLowerCase()) ||
			row.description.toLowerCase().includes(queryString.toLowerCase()),
	);
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
