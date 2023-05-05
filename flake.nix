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
      node = pkgs.nodejs-18_x;
      nodeModules = nl2nix.v2.node_modules {
        src = ./.;
        nodejs = node;
      };
      # binaries that this tool shells out to at runtime
      extBins = with pkgs; [kubectl kubernetes-helm git];
      binPaths = builtins.concatStringsSep ":" (builtins.map (p: "${p}/bin") extBins);
    in rec {
      defaultPackage = package.wedgecli;
      package.wedgecli = nl2nix.v2.build {
        src = ./.;
        buildCommands = ["npm run build"];
        installPhase = ''
          # buildCommands are executed in a temp dir; here we
          # move the build outputs into our package dir ($out)
          # we move package.json as well so that node treats
          # us as an ES module, as it specifies type: "module"
          mkdir -p $out/bin
          mv dist $out/dist
          mv package.json $out/package.json

          # node_modules are not linked by default, which makes
          # sense for things like front-end packages
          ln -s ${nodeModules}/node_modules $out/dist/node_modules

          # create a startup script that sets the module resolution
          # path (NODE_PATH) and the PATH to include the binaries
          # that are referenced by this project
          cat - <<EOF > $out/bin/wedgecli
            export NODE_PATH=${placeholder "out"}/dist/node_modules
            export PATH=${binPaths}:$PATH
            exec ${node}/bin/node ${placeholder "out"}/dist/cli.js "\$@"
          EOF
          chmod +x $out/bin/wedgecli
        '';
        node_modules_attrs = {
          # use a specific version of node
          nodejs = node;
        };
      };
      devShell = nl2nix.v2.shell {
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
