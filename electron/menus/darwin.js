module.exports = function (window) {
    return [{
        label: 'Emerald',
        submenu: [
            {
                role: 'about',
            },
            {
                type: 'separator',
            },
            {
                role: 'services',
                submenu: [],
            },
            {
                type: 'separator',
            },
            {
                role: 'hide',
            },
            {
                role: 'hideothers',
            },
            {
                role: 'unhide',
            },
            {
                type: 'separator',
            },
            {
                role: 'quit',
            },
        ]}, {
            label: 'Edit',
            submenu: [
                {
                    role: 'undo',
                },
                {
                    role: 'redo',
                },
                {
                    type: 'separator',
                },
                {
                    role: 'cut',
                },
                {
                    role: 'copy',
                },
                {
                    role: 'paste',
                },
                {
                    role: 'delete',
                },
                {
                    role: 'selectall',
                },
            ]},
    {
        label: 'View',
        submenu: [
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click() { window.webContents.reload(); },
            },
            {
                label: 'Developer Tools',
                accelerator: 'Alt+Command+I',
                click() { window.toggleDevTools(); },
            },
            {
                type: 'separator',
            },
            {
                role: 'resetzoom',
            },
            {
                role: 'zoomin',
            },
            {
                role: 'zoomout',
            },
            {
                type: 'separator',
            },
            {
                role: 'togglefullscreen',
            },
        ],
    }];
};
