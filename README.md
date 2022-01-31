# cheerpX demo

Setup offline

```sh
set -eu

mkdir -p cx
(
    cd cx
    for file in \
        cx.js \
        cheerpOS.js \
        tun/tailscale_tun_auto.js \
        tun/tailscale_tun.js \
        tun/wasm_exec.js \
        tun/ipstack.js \
        cxcore.js \
        cxcore.wasm \
        workerclock.js \
        cxcore-no-return-call.js \
        cxcore-no-return-call.wasm; do
        if [ ! -f "${file}" ]; then
            mkdir -p $(dirname "${file}")
            echo "Downloading ${file}"
            curl -LkSs https://cxrtnc.leaningtech.com/1.0.9/${file} >${file}.tmp
            mv ${file}.tmp ${file}
        fi
    done
)

```
