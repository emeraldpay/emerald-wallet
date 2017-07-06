import {BrowserWindow, Menu, shell } from 'electron';
import winLinuxMenu from './menus/win-linux';
const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
export let mainWindow;
let menu;

export function createWindow(openDevTools) {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 1060, height: 600});

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../app/index.html'),
        protocol: 'file:',
        slashes: true,
    }));

    // Open the DevTools.
    if (openDevTools) {
        mainWindow.webContents.openDevTools();
        require('devtron').install();
    }
    // Prevent opening external links in electron.
    mainWindow.webContents.on('will-navigate', (e, _url) => {
        e.preventDefault();
        shell.openExternal(_url);
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    // Menu (only win and linux for now)
    menu = Menu.buildFromTemplate(winLinuxMenu(mainWindow));
    Menu.setApplicationMenu(menu);
    mainWindow.setMenu(menu);

    return mainWindow.webContents;
}
