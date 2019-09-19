export default function (window: any, menuHandlers: any): any {
  return [{
    label: 'Emerald',
    submenu: [
      {
        label: 'About',
        click () {
          menuHandlers.onAbout();
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  }, {
    label: 'Edit',
    submenu: [
      {
        role: 'undo'
      },
      {
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      },
      {
        role: 'delete'
      },
      {
        role: 'selectall'
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click () { window.webContents.reload(); }
      },
      {
        label: 'Developer Tools',
        accelerator: 'Alt+Command+I',
        click () { window.toggleDevTools(); }
      },
      {
        label: 'Open Logs',
        click () {
          menuHandlers.onOpenLog();
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click () {
          menuHandlers.onAbout();
        }
      }
    ]
  }];
}
