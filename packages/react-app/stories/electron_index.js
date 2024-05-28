const {default: installExtension, REACT_DEVELOPER_TOOLS} = require('electron-devtools-installer')
const app = require('electron').app
const BrowserWindow = require('electron').BrowserWindow
app.commandLine.appendSwitch('disable-web-security')
app.commandLine.appendSwitch('remote-debugging-port', '5858')

//
// To run:
// yarn workspace @emeraldwallet/react-app run storybook
// yarn workspace @emeraldwallet/react-app run storybook:electron
//

app.on('ready', function () {

  console.log("Starting Electron app");

  let mainWindow = new BrowserWindow({
    width: 1410,
    height: 830,
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
  });

  mainWindow.loadURL('http://localhost:9001')
    .then(() => { console.log("Opened Storybook") })
    .catch((err) => { console.error("Error opening Storybook", err) })

  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('Failed to add Extension: ', err));
})
