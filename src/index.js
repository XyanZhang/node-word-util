const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip'); //引入查看zip文件的包
let filePath = path.join(__dirname, '../file/CFP代付授权协议0807.docx');
const zip = new AdmZip(filePath); //filePath为文件路径
let contentXml = zip.readAsText('word/document.xml'); //将document.xml读取为text内容；
let str = '';
contentXml.match(/<w:t>[\s\S]*?<\/w:t>/gi).forEach((item) => {
  str += item.slice(5, -6);
});
fs.writeFile('./dist/content.txt', str, (err) => {
  //将./2.txt替换为你要输出的文件路径
  if (err) throw err;
});
