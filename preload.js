const { ipcRenderer } = require('electron');
const events = require('events');

const postMessage = (msg) => {
    document.getElementById('receiver').contentWindow.postMessage(msg, '*');
}

// 创建事件总线
const EventBus = new events.EventEmitter();

var worker;

// 异步总线监听
EventBus.on('get-link', () => {
    // 创建线程
    worker = new Worker('worker.js');
    worker.onmessage = ev => {
        if (ev.data.error) {
            postMessage(ev.data.error);
            ipcRenderer.send('close-view')
        }
        if (ev.data.success) {
            postMessage(ev.data.success);
            ipcRenderer.send('close-view')
        }
    }
    worker.onerror = err => {
        worker.terminate()
        console.log(err.filename, err.lineno, err.message) // 发生错误的文件名、行号、错误内容
    }
});

// 收到子窗口关闭信号时销毁线程
ipcRenderer.on('closed-view', () => {
    console.log('线程已被销毁');
    worker.terminate();
})

// 监听 iframe 通信
window.onmessage = function(e) {
    if (e.data.type === 'minmize') {
        ipcRenderer.send('window-min');
    }
    if (e.data.type === 'maxmize') {
        ipcRenderer.send('window-max');
    }
    if (e.data.type === 'close') {
        ipcRenderer.send('window-close');
    }
    if (e.data.type === 'openGetLink') {
        ipcRenderer.send('create-view');
        EventBus.emit('get-link');
    }
}