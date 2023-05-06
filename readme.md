# 🧀 Wedge

`wedge` is a CLI tool that makes it easy to download and use Large Language Models (LLMs) by providing access to both models and their corresponding weights. All models run via `wedge` expose a simple, standardized local HTTP interface, making it easy to experiment with models or build model-agnostic tools that rely on LLMs. `wedge` also includes a CLI chat UX for interacting directly with installed models. The ability to add new packages/models to the `wedge` repository is coming soon. Meanwhile, if you're interested in contributing, [shoot me an email](mailto:me@vishnumenon.com)!

## Roadmap

Wedge is currently very early/experimental, and under active development. Expect bugs, and report them if you find them! Here's a roadmap of future development plans:

- [x] Searching for / listing models
- [x] Downloading models & weights
- [x] Serving models via local HTTP interface
- [x] CLI chat interface
- [ ] uploading new LLMs to `wedge` repository
- [ ] Creating & managing separate 'agents' for models
- [ ] Persistence for conversation history
- [ ] Integrated knowledge bases for agents
- [ ] Browser integration via chrome extension

## Getting Started

To install `wedge`, run this command from inside your terminal:

```
curl -sSL https://pkg.wedgecli.com/install.sh | bash
```

Wedge uses [Nix](nixos.org) under the hood for managing dependencies and environments, so running this command will first install Nix (if it's not already present), then install the `wedge` CLI.

## Requirements

To use `wedge`, you need to be running a Unix-based OS (e.g. Linux or OS X). We've currently tested on Ubuntu, Fedora, and OS X, but others should work too, including WSL on Windows (probably). You also need to have `bash` present on your system, even if it isn't your primary shell (if you're not sure, you almost certainly already have it). That's all!

## Advanced Installation Method

Prefer a more manual installation process, and have some familiarity with Nix? The command above basically does these steps:

1. [Install Nix](https://nixos.org/download.html) (follow the appropriate directions for your OS)
2. Configure Nix to enable the `flakes` and `nix-command` experimental features
3. Create the wedge directory: `mkdir ~/.wedge`
4. Build the wedge flake and store the output in the wedge directory: `nix build github:wedge-pm/wedge -o ~/.wedge/cli`
5. Modify the appropriate file to add `~/.wedge/cli/bin` to your `PATH`

## Usage

### `wedge search <query>`

Search model names & descriptions for a model that matches the provided query. Models can be directly installed from search results.

### `wedge list`

List all available models in the `wedge` repository. The list is navigable, and models can be directly installed from within the list.

### `wedge install <model>`

Install a model by name. Installing a model fetches the model code as well as the necessary weights, and runs any build/setup steps necessary to prepare for use.

### `wedge uninstall <model>`

Uninstall a currently installed model

### `wedge serve <model>`

Spins up a local server that provides access to the specified model at `localhost:9801/chat`.

Currently, this endpoint accepts `POST` requests with a JSON body having the following structure:

```
{
  "message": "..."
}
```

and returns a JSON response with the same structure. Additional keys for setting parameters and customizing behavior will be added soon.

### `wedge chat <model>`

Launches a CLI-based chat interface for interacting with the model.
