export default (window) => {
  return [{
    label: '&Emerald',
    submenu: [{
      label: '&Close',
      accelerator: 'Ctrl+W',
      click() {
        window.close()
      }
    }]
  }, {
    label: '&View',
    submenu: [
      {
        label: '&Reload',
        accelerator: 'Ctrl+R',
        click() { window.webContents.reload() }
      },
      {
        label: '&Full Screen',
        accelerator: 'F11',
        click() { window.setFullScreen(!window.isFullScreen()) }
      },
      {
        label: '&Developer Tools',
        accelerator: 'Alt+Ctrl+I',
        click() { window.toggleDevTools() }
      }
    ]
  }]
}