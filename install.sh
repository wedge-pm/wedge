echo -e "\n\n"

cat <<EOF 
█ █ █ █▀▀ █▀▄ █▀▀ █▀▀   █ █▄ █ █▀ ▀█▀ ▄▀█ █   █   █▀▀ █▀█
▀▄▀▄▀ ██▄ █▄▀ █▄█ ██▄   █ █ ▀█ ▄█  █  █▀█ █▄▄ █▄▄ ██▄ █▀▄
EOF

echo -e "\n\n\n\n"

NIX_SH_ENV_FILE=
NIX_FISH_ENV_FILE=

if ! command -v nix &> /dev/null ; then

    echo "The Wedge LLM Manager depends on Nix. Nix was not found on your system, so this script will now install it for you."                   
    echo -e "\n\n\n\n"

    tput dim

    curl -L https://nixos.org/nix/install | sh

    echo -e "\n\n\n\n"
    echo "Installing the Wedge LLM Manager..."


    if [ -f "/nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh" ]; then
        source "/nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh"
        NIX_SH_ENV_FILE="/nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh"
        NIX_FISH_ENV_FILE="/nix/var/nix/profiles/default/etc/profile.d/nix-daemon.fish"
    fi

    if [ -f "$HOME/.nix-profile/etc/profile.d/nix.sh" ]; then
        source "$HOME/.nix-profile/etc/profile.d/nix.sh"
        NIX_SH_ENV_FILE="$HOME/.nix-profile/etc/profile.d/nix.sh"
        NIX_FISH_ENV_FILE="$HOME/.nix-profile/etc/profile.d/nix.fish"
    fi
else
    tput dim
fi

mkdir -p ~/.wedge
export NIX_CONFIG="extra-experimental-features = flakes nix-command"
nix build github:wedge-pm/wedge -o ~/.wedge/cli

p_sh="export PATH=\"$HOME/.wedge/cli/bin:\$PATH\""
p_fish="fish_add_path $HOME/.wedge/cli/bin"
p=
np=

# Modify shell configs to add wedge to path
for i in .bash_profile .bash_login .profile; do
    fn="$HOME/$i"
    if [ -w "$fn" ]; then
        if ! grep -q "$p_sh" "$fn"; then
            echo "modifying $fn..." >&2
            printf '%s # added by wedge installer\n' "$p_sh" >> "$fn"
        fi
        p=${p_sh}
        if [ -n "$NIX_SH_ENV_FILE" ]; then
            np="source ${NIX_SH_ENV_FILE}"
        fi
        break
    fi
done
for i in .zshenv .zshrc; do
    fn="$HOME/$i"
    if [ -w "$fn" ]; then
        if ! grep -q "$p_sh" "$fn"; then
            echo "modifying $fn..." >&2
            printf '%s # added by wedge installer\n' "$p_sh" >> "$fn"
        fi
        p=${p_sh}
        if [ -n "$NIX_SH_ENV_FILE" ]; then
            np="source ${NIX_SH_ENV_FILE}"
        fi
        break
    fi
done
if [ -d "$HOME/.config/fish" ]; then
    fishdir=$HOME/.config/fish/conf.d
    if [ ! -d "$fishdir" ]; then
        mkdir -p "$fishdir"
    fi

    fn="$fishdir/wedge.fish"
    echo "placing $fn..." >&2
    printf '%s # added by wedge installer\n' "$p_fish" > "$fn"
    p=${p_fish}
    if [ -n "$NIX_FISH_ENV_FILE" ]; then
        np="source ${NIX_FISH_ENV_FILE}"
    fi
fi

if [ -z "$p" ]; then
    echo "Could not find a user shell config file to modify. Creating .profile and .zshrc..."
    printf '%s # added by wedge installer\n' "$p_sh" > "$HOME/.profile"
    printf '%s # added by wedge installer\n' "$p_sh" > "$HOME/.zshrc"
    p=${p_sh}
    if [ -n "$NIX_SH_ENV_FILE" ]; then
        np="source ${NIX_SH_ENV_FILE}"
    fi
fi

BGreen='\033[1;32m'       # Green

tput sgr0
tput setaf 2
cat <<EOF 










Wedge LLM Manager has been installed successfully!

To start using it, please run the following commands
to set the appropriate environment variables in the current shell, or log out & log back in:

    $np
    $p

Then, use these commands to get started:

    wedge list (list all available LLM packages)
    wedge install <llm> (install an LLM)
    wedge chat (Chat with an installed LLM)
    wedge serve <llm> (serve an LLM on localhost:9801/chat)
    wedge uninstall <llm> (uninstall an LLM)
    wedge --help (show help message)

EOF
tput setaf default