class UserNotify {

    constructor(webContents) {
        this.webContents = webContents;
        webContents.on('close', () => this.webContents = null)
    }

    info(msg) {
        if (this.webContents) {
            this.webContents.send("launcher", "MESSAGE", {msg: msg, level: 2});
        }
    }

    error(msg) {
        if (this.webContents) {
            this.webContents.send("launcher", "MESSAGE", {msg: msg, level: 3});
        }
    }

    status(name, mode) {
        if (this.webContents) {
            this.webContents.send("launcher", "SERVICE_STATUS", {service: name, mode: mode});
        }
    }

    chain(rpc, chain, chainId) {
        if (this.webContents) {
            this.webContents.send("launcher", "CHAIN", {rpc, chain, chainId});
        }
    }

    rpcUrl(url) {
        if (this.webContents) {
            this.webContents.send("launcher", "RPC", {url});
        }
    }
}

module.exports = {
    UserNotify: UserNotify
};