const {default: installExtension, REACT_DEVELOPER_TOOLS} = require('electron-devtools-installer')
const app = require('electron').app
const BrowserWindow = require('electron').BrowserWindow
app.commandLine.appendSwitch('disable-web-security')
app.commandLine.appendSwitch('remote-debugging-port', '5858')

//
// To run:
// yarn workspace @emeraldwallet/react-app run storybook
// electron packages/react-app/stories/electron_index.js
//

app.on('ready', function () {

  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    allowRunningInsecureContent: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInSubFrames: true,
      webviewTag: false,
      sandbox: false,
      allowRunningInsecureContent: true,
      offscreen: false,
      webSecurity: false,
      contextIsolation: false,
    },
  })

  mainWindow.loadURL('http://localhost:9001')

  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
})