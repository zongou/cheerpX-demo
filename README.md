# CheerpX Demo

Run linux in browser

## Run server

```sh
node server.js
```

## Make ext2 image

```sh
export PATH=${PATH}:/sbin/

sizeInMB=$(du -ahd0 rootfs | awk '{print $1}' | sed 's/M//g')
echo "Size of rootfs dir is ${sizeInMB} MB"

iamgeSize=$((${sizeInMB} + sizeInMB / 10))
echo "Size of rootfs.ext2 is ${iamgeSize} MB"

mkfs.ext2 -b 4096 -d rootfs rootfs.ext2 "${iamgeSize}M" -F

```

## Setup rootfs

### with prootie

```sh
#!/bin/sh
set -eu

rm -rf rootfs
# curl -LkSs https://mirrors.ustc.edu.cn/alpine/latest-stable/releases/x86/alpine-minirootfs-3.21.3-x86.tar.gz | gzip -d | prootie install rootfs -v
curl -LkSs https://mirrors.ustc.edu.cn/alpine/edge/releases/x86/alpine-minirootfs-20250108-x86.tar.gz | gzip -d | prootie install rootfs -v

```

Login

```sh
prootie login rootfs
```

Setup

```sh
cat <<EOF >rootfs/etc/apk/repositories
https://mirrors.ustc.edu.cn/alpine/latest-stable/main
https://mirrors.ustc.edu.cn/alpine/latest-stable/community
EOF

```

```sh
cat <<EOF >rootfs/etc/apk/repositories
https://dl-cdn.alpinelinux.org/alpine/edge/main
https://dl-cdn.alpinelinux.org/alpine/edge/community
EOF

```

```sh
prootie login rootfs -- /bin/sh -l -c "adduser user"
prootie login rootfs -- /bin/sh -l -c "apk add --no-cache bash bash-completion"

```

### With PRoot

```sh
proot --rootfs=$PWD/rootfs --cwd=/root /bin/sh -l
```

### With chroot

```sh
#!/bin/sh
set -eu

echo start
ROOTFS_DIR=cheerpXFS
TARBALL_URL=https://mirrors.ustc.edu.cn/alpine/latest-stable/releases/x86/alpine-minirootfs-3.21.3-x86.tar.gz
CHEERPX_IMAGE=rootfs.ext2

if ! [ -d "${ROOTFS_DIR}" ]; then
    mkdir -p ${ROOTFS_DIR}
    curl -Lk "${TARBALL_URL}" | gzip -d | tar -C ${ROOTFS_DIR} -xv

    if [ ! -f "${ROOTFS_DIR}/ect/resolv.conf" ]; then
        cat <<EOF >"${ROOTFS_DIR}/etc/resolv.conf"
nameserver 8.8.8.8
nameserver 8.8.4.4
EOF
    fi

    if [ ! -f "${ROOTFS_DIR}/etc/hosts" ]; then
        cat <<EOF >"${ROOTFS_DIR}/etc/hosts"
127.0.0.1 localhost
::1 localhost ip6-localhost ip6-loopback
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
EOF
    fi

    if [ ! -f "${ROOTFS_DIR}/etc/passwd" ]; then
        cat <<EOF >"${ROOTFS_DIR}/etc/passwd"
root:x:0:0:root:/root:/bin/sh
bin:x:1:1:bin:/bin:/sbin/nologin
daemon:x:2:2:daemon:/sbin:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
sync:x:5:0:sync:/sbin:/bin/sync
shutdown:x:6:0:shutdown:/sbin:/sbin/shutdown
halt:x:7:0:halt:/sbin:/sbin/halt
mail:x:8:12:mail:/var/mail:/sbin/nologin
news:x:9:13:news:/usr/lib/news:/sbin/nologin
uucp:x:10:14:uucp:/var/spool/uucppublic:/sbin/nologin
cron:x:16:16:cron:/var/spool/cron:/sbin/nologin
ftp:x:21:21::/var/lib/ftp:/sbin/nologin
sshd:x:22:22:sshd:/dev/null:/sbin/nologin
games:x:35:35:games:/usr/games:/sbin/nologin
ntp:x:123:123:NTP:/var/empty:/sbin/nologin
guest:x:405:100:guest:/dev/null:/sbin/nologin
nobody:x:65534:65534:nobody:/:/sbin/nologin
user:x:1000:1000:Linux User,,,:/home/user:/bin/bash
EOF
    fi

    if [ ! -f "${ROOTFS_DIR}/etc/subgid" ]; then
        cat <<EOF >"${ROOTFS_DIR}/etc/subgid"
user:100000:65536
EOF
    fi
fi

/sbin/mkfs.ext2 -b 4096 -d ${ROOTFS_DIR} ${CHEERPX_IMAGE} 100M -F

```
