interface OptionDetails {
	prompt: string;
	subprompt?: string;
	type: 'string' | 'number' | 'boolean';
}

export interface WedgeConfig {
	name: string;
	// Weights to download
	weights?: string[];
	// Nix flake to build
	flake?: string;
	// Command to run for setup, after building flake (if provided)
	setup?: string;
	// User-provided options for model and model's agents
	options?: {
		model?: {
			[optionName: string]: OptionDetails;
		};
		agent: {
			[optionName: string]: OptionDetails;
		};
	};
	// Command to run to launch model server
	serve: string;
}
