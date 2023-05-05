import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'node:util';
import stream from 'node:stream';
import got from 'got';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node/index.js';

const pipeline = promisify(stream.pipeline);

function copyLocal(sourcePath: string, destinationPath: string): void {
	const sourceStat = fs.statSync(sourcePath);
	const isSourceDirectory = sourceStat.isDirectory();

	if (isSourceDirectory) {
		// If the source path is a directory, copy all of its contents to the destination
		fs.readdirSync(sourcePath, {
			withFileTypes: true,
		}).forEach(fileName => {
			if (fileName.isDirectory()) {
				return copyLocal(
					path.join(sourcePath, fileName.name),
					path.join(destinationPath, fileName.name),
				);
			} else {
				copyLocal(path.join(sourcePath, fileName.name), destinationPath);
			}
		});
	} else {
		// If the source path is a file, copy it to the destination
		const sourceFileName = path.basename(sourcePath);
		fs.mkdirSync(destinationPath, {recursive: true});
		const destinationFilePath = path.join(destinationPath, sourceFileName);
		fs.copyFileSync(sourcePath, destinationFilePath);
	}
}

async function cloneGit(url: string, destination: string) {
	await git.clone({
		fs,
		http,
		dir: destination,
		url: url,
		singleBranch: true,
		depth: 1,
	});
}

async function fetchHttp(
	url: string,
	destination: string,
	onProgress?: (progress: number) => void,
) {
	fs.mkdirSync(destination, {recursive: true});
	const destinationFilePath = path.join(
		destination,
		decodeURIComponent(path.basename(new URL(url).pathname)),
	);
	await pipeline(
		got.stream(url).on('downloadProgress', progress => {
			onProgress?.(progress.percent);
		}),
		fs.createWriteStream(destinationFilePath, {flags: 'w'}),
	);
}

export async function download(
	path: string,
	destination: string,
	onProgress?: (progress: number) => void,
) {
	const [protocol, ...sourceComponents] = path.split(':');
	const source = sourceComponents.join(':');
	switch (protocol) {
		case 'http':
		case 'https':
			await fetchHttp(path, destination, onProgress);
			break;
		case 'file':
			copyLocal(source, destination);
			break;
		case 'git':
			await cloneGit(source, destination);
			break;
		default:
			throw new Error(`Unsupported protocol: ${protocol}`);
	}
}
