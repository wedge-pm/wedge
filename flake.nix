{
  inputs = {
    nixpkgs.url = "nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    npmlock2nix = {
      url = "github:nix-community/npmlock2nix/master";
      flake = false;
    };
  };
  outputs = {
    self,
    nixpkgs,
    flake-utils,
    npmlock2nix,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages."${system}";
      nl2nix = import npmlock2nix {inherit pkgs;};
      node = pkgs.nodejs-14_x;
      nodeModules = nl2nix.node_modules {
        src = ./.;
        nodejs = node;
      };
      # binaries that this tool shells out to at runtime
      extBins = with pkgs; [kubectl kubernetes-helm git];
      binPaths = builtins.concatStringsSep ":" (builtins.map (p: "${p}/bin") extBins);
    in rec {
      defaultPackage = package.nodenix;
      package.nodenix = nl2nix.build {
        src = ./.;
        buildCommands = ["swc src -d lib --config-file swcrc.json"];
        installPhase = ''
          # buildCommands are executed in a temp dir; here we
          # move the build outputs into our package dir ($out)
          # we move package.json as well so that node treats
          # us as an ES module, as it specifies type: "module"
          mkdir -p $out/bin
          mv lib $out/lib
          mv package.json $out/package.json

          # node_modules are not linked by default, which makes
          # sense for things like front-end packages
          ln -s ${nodeModules}/node_modules $out/lib/node_modules

          # create a startup script that sets the module resolution
          # path (NODE_PATH) and the PATH to include the binaries
          # that are referenced by this project
          cat - <<EOF > $out/bin/nodenix
            export NODE_PATH=${placeholder "out"}/lib/node_modules
            export PATH=${binPaths}:$PATH
            exec ${node}/bin/node ${placeholder "out"}/lib/main.js "$@"
          EOF
          chmod +x $out/bin/nodenix
        '';
        node_modules_attrs = {
          # use a specific version of node
          nodejs = node;
        };
      };
      devShell = nl2nix.shell {
        src = ./.;
        node_modules_attrs = {
          nodejs = node;
        };
        nativeBuildInputs =
          (with pkgs; ([
              # alejandra is used for nix file formatting
              alejandra
            ]
            ++ (
              lib.optionals stdenv.isDarwin [
                # iirc this is needed for node packages that
                # build native binaries
                darwin.apple_sdk.frameworks.CoreServices
              ]
            )))
          ++ extBins;
      };
    });
}
