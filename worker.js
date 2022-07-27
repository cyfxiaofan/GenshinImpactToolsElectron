const fs = require("fs")


const CONTENT_TYPES = {
  errorTips: 'errorTips', // 错误提示
  link: 'link', // 提取到的链接
}


// 提取链接
const getLink = function () {
  return new Promise((resolve, reject) => {
    try {
      let _matchList = __readFile()
      while (_matchList === null) {
        _matchList = __readFile()
      }
      resolve({ success: { 'link': _matchList.slice(-1)[0], contentType: CONTENT_TYPES.link } })
    }
    catch (err) {
      resolve({ error: { 'message': '找不到日志文件' + err, contentType: CONTENT_TYPES.errorTips } })
    }
  })
}




const __readFile = () => {
  let _path = '%userprofile%\\AppData\\LocalLow\\miHoYo\\原神\\output_log.txt';
  // 替换 %userprofile% 为用户的主目录
  _path = _path.replace('%userprofile%', process.env.USERPROFILE);
  reg = /(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]\/log/g;
  fd = fs.openSync(_path, 'r');
  let _dataStr = fs.readFileSync(fd, 'UTF8')
  fs.close(fd);
  return _dataStr.match(reg);
}


getLink().then((res) => {
  self.postMessage(res);
})