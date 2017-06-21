export class UserNotify {

    constructor(webContents) {
        this.webContents = webContents;
    }

    info(msg) {
        this.webContents.send("launcher", "MESSAGE", {msg: msg, level: 2});
    }

    error(msg) {
        this.webContents.send("launcher", "MESSAGE", {msg: msg, level: 3});
    }

    status(name, mode) {
        this.webContents.send("launcher", "SERVICE_STATUS", {service: name, mode: mode});
    }

    chain(rpc, chain, chainId) {
        this.webContents.send("launcher", "CHAIN", {rpc, chain, chainId});
    }
}