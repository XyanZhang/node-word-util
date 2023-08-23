const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip'); //引入查看zip文件的包
// let filePath = path.join(__dirname, '../file/CFP代付授权协议0807.docx');
let filePath = path.join(__dirname, '../file/中级经济师（高效取证班协议）0807.docx');
const zip = new AdmZip(filePath); //filePath为文件路径
let contentXml = zip.readAsText('word/document.xml'); //将document.xml读取为text内容；


const xmlUtil = require('./xmlParse');
const { strongTag, aTag } = require('./tagHandlle');
let xmlJsonObj = xmlUtil.parseXml(contentXml, {
  ignoreAttributes: true,
  attributeNamePrefix : "@_",
  allowBooleanAttributes: true,
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
    for (const key in wp) {
      if(key === 'w:r') {
        let wrs = wp['w:r'];
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
      }
      // !bug: 该库解析出来的xml中，w:hyperlink 不是按照顺序进行解析，导致生成的html中，a标签的位置不对
      else if(key === 'w:hyperlink') {
        let whyperlinks = wp['w:hyperlink'];
        let wr = whyperlinks['w:r'];
        let wrpr = wr['w:rPr'];
        let wts = wr['w:t'];
        if (wts) {
          let isA = true;
          html += aTag(isA, wts);
        }
      }
    }
    html += pTagEnd;
  });
  return html;
}

let resultText = traverse(wps);
// console.dir(wps, { depth: null });
fs.writeFile('./dist/content1.html', resultText, (err) => {
  if (err) throw err;
});
fs.writeFile('./dist/contentTxt1.txt', resultText, (err) => {
  if (err) throw err;
});