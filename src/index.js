const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip'); //引入查看zip文件的包
// let filePath = path.join(__dirname, '../file/CFP代付授权协议0807.docx');
// let filePath = path.join(__dirname, '../file/中级经济师（高效取证班协议）0807.docx');
let filePath = path.join(__dirname, '../file/银行从业资格（精英取证班协议）20230913.docx');
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
let addOuter = (innerHtml = '') => `
<p class="font-bold center"></p>
<p class="font-bold">甲方（学员）： <span><%= userInfo && userInfo.realName || ''%></span></p>
<p class="font-bold">电话号码：<%= userInfo && userInfo.realName ? userInfo.mobile : ''%></p>
<p class="font-bold">身份证号：<%= userInfo ? userInfo.idCard : ''%></p>
<p class="font-bold">邮箱：<%= userInfo && userInfo.ext ? (userInfo.ext.email || '') : ''%></p>
<p class="font-bold">乙方：成都市华金财商教育科技有限公司</p>
${innerHtml}
<p>（以下无正文，为本协议签章处）</p>
<p class="pos-rel">甲方：
    <% if(userAgreement && userAgreement.signState == 1) {%>
        <img class="sign-img" src="<%=userAgreement.autographImg%>" width="120px" height="60px" alt="">
        <!-- <img class="sign-img" src="/img/signimg.jpeg" width="120px" height="60px" alt=""> -->
    <% } else { %>​
        <%= userAgreement && userInfo && userInfo.realName || ''%>
    <% } %>​

    <% if(userAgreement) {%>
        <img class="contract-seal" src="<%=cdnPrefix%>/img/huajin-contract-seal.png" width="100px" height="100px" alt="">
    <% } %>​
</p>
<p>日期：<%= userAgreement && utilDateFormat(userAgreement.createTime*1000, 'ymd')%></p>
<p>​<br></p>
<p>乙方：成都市华金财商教育科技有限公司</p>
<p>日期：<%= userAgreement && utilDateFormat(userAgreement.createTime*1000, 'ymd')%></p>
<p>​<br></p>
`
// console.dir(wps, { depth: null });
fs.writeFile('./dist/content1.html', addOuter(resultText), (err) => {
  if (err) throw err;
});
fs.writeFile('./dist/contentTxt1.txt', resultText, (err) => {
  if (err) throw err;
});