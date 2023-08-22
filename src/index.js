const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip'); //引入查看zip文件的包
let filePath = path.join(__dirname, '../file/CFP代付授权协议0807.docx');
const zip = new AdmZip(filePath); //filePath为文件路径
let contentXml = zip.readAsText('word/document.xml'); //将document.xml读取为text内容；


const xmlUtil = require('./xmlParse');
const { strongTag } = require('./tagHandlle');
let xmlJsonObj = xmlUtil.parseXml(contentXml, {
  ignoreAttributes: true,
  attributeNamePrefix : "@_",
  allowBooleanAttributes: true
});
// console.dir(xmlJsonObj, { depth: null }); //depth: null表示不限制深度

// 获取 xmlJsonObj 中 w:p 标识为行，w:t 标识为文本的内容，并且生成 html 结构
// w:r： 表示行内内容，如字体，字号，颜色等
// w:pPr： 表示行的属性，如行高，缩进等
// w:rPr： 表示行内内容的属性，如字体，字号，颜色等
// w:t： 表示文本内容
// w:br： 表示换行
let html = '';
let wps = xmlJsonObj['w:document']['w:body']['w:p'];

let traverse = (wps) => {
  wps.forEach((wp, index) => {
    let pTagStart = '<p>';
    let pTagEnd = '</p>\n';
    html += pTagStart;
    let wrs = wp['w:r'];
    if(!wrs) {
      html += pTagEnd;
      return '';
    }
    if(Array.isArray(wrs)) {
      let wrpr = wrs['w:rPr'];
      wrs.forEach((wr, index) => {
        let wrpr = wr['w:rPr'];
        let wt = wr['w:t'];
        if (wt) {
          let isStrong = wrpr['w:b'] != null;
          html += strongTag(isStrong, wt);
        }
      });
    }else {
      let wrpr = wrs['w:rPr'];
      let wts = wrs['w:t'];
      if (wts) {
        let isStrong = wrpr['w:b'] != null;
        html += strongTag(isStrong, wts);
      }
    }
    html += pTagEnd;
  });
  return html;
}
let resultText = traverse(wps);
// console.dir(wps, { depth: null });
fs.writeFile('./dist/content.html', resultText, (err) => {
  if (err) throw err;
});
fs.writeFile('./dist/contentTxt.txt', resultText, (err) => {
  if (err) throw err;
});