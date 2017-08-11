const ipcMain = require('electron').ipcMain;
const log = require('electron-log');

module.exports = function (services) {

    ipcMain.on('get-status', (event) => {
        event.returnValue = 'ok';
        services.notifyStatus();
    });

};
