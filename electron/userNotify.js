class UserNotify {

    constructor(webContents) {
        this.webContents = webContents;
        webContents.on('close', () => { this.webContents = null; });
    }

    info(msg) {
        if (this.webContents) {
            this.webContents.send('launcher', 'MESSAGE', {msg, level: 2});
        }
    }

    error(msg) {
        if (this.webContents) {
            this.webContents.send('launcher', 'MESSAGE', {msg, level: 3});
        }
    }

    status(name, mode) {
        if (this.webContents) {
            this.webContents.send('launcher', 'SERVICE_STATUS', {service: name, mode});
        }
    }

    chain(chain, chainId) {
        if (this.webContents) {
            this.webContents.send('launcher', 'CHAIN', { chain, chainId });
        }
    }
}

module.exports = {
    UserNotify,
};
