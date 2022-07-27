// main.js
// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, globalShortcut, ipcMain, ipcRenderer } = require('electron');
const path = require('path')

var view;

const createWindow = () => {
    Menu.setApplicationMenu(null);
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false,
            nodeIntegration: true,
            contextIsolation: true,
            nodeIntegrationInWorker: true
        }
    })

    // 加载 index.html
    mainWindow.loadFile('index.html')

    // 打开开发工具
    // mainWindow.webContents.openDevTools()

    mainWindow.webContents.on('before-input-event', (event, input) => {
        // input.control 判断是否按下 ctrl
        // input.type 判断是按下还是抬起
        // 按F12 打开开发者工具
        if (input.key === 'F12' && input.type === 'keyDown') {
            mainWindow.webContents.openDevTools()
        }
    })

    // 实现自定义标题栏，最小化，最大化，关闭
    ipcMain.on("window-min", () => mainWindow.minimize());
    ipcMain.on("window-max", () => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });
    ipcMain.on("window-close", () => {
        mainWindow.destroy();
    });

    // 打开链接提取窗口
    ipcMain.on("create-view", (e) => {
        view = new BrowserWindow({
            width: 350,
            height: 100,
            parent: mainWindow,
            alwaysOnTop: true,
            icon: './logo.ico'
        })
        mainWindow.setBrowserView(view)
        view.setBounds({ x: mainWindow.getBounds().x + mainWindow.getBounds().width, y: mainWindow.getBounds().y })
        view.webContents.loadFile('./link.html');
        view.on('closed', () => {
            mainWindow.setBrowserView(null)
            e.reply('closed-view')
        })
    });

    ipcMain.on("close-view", () => {
        view && view.close()
        mainWindow.setBrowserView(null)
    });

    // 允许iframe访问第三方url
    mainWindow.webContents.session.webRequest.onHeadersReceived({ urls: ["*://*/*"] },
        (d, c) => {
            if (d.responseHeaders['X-Frame-Options']) {
                delete d.responseHeaders['X-Frame-Options'];
            } else if (d.responseHeaders['x-frame-options']) {
                delete d.responseHeaders['x-frame-options'];
            }
            c({ cancel: false, responseHeaders: d.responseHeaders });
        }
    );
}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
    createWindow()

    globalShortcut.register('Home', () => {
        app.quit()
        app.relaunch()
    })

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// app.commandLine.appendSwitch('touch-events', 'enabled');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

// In this file you can include the rest of your app's specific main process
// code. 也可以拆分成几个文件，然后用 require 导入。