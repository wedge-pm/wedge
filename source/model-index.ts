import * as csv from 'csv/sync';
import {readFileSync, writeFileSync} from 'fs';
import * as path from 'path';
import {INDEX_DIRECTORY} from './constants.js';

const INDEX_PATH = path.join(INDEX_DIRECTORY, 'index.csv');

export interface IndexRow {
	name: string;
	description: string;
	location: string;
	size: string;
	language: string;
}

export function refreshIndex() {
	// TODO: Replace with fetching index from remote
	const csv_text = readFileSync(
		'/home/vishnumenon/Documents/data-for-wedge/wedge-index.csv',
		'utf-8',
	);

	const latest_index = csv.parse(csv_text, {
		columns: true,
	});
	writeFileSync(INDEX_PATH, csv.stringify(latest_index, {header: true}));
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
