module.exports = function strMatchHandle(contentXml, distPath) {
  let str = '';
  contentXml.match(/<w:t>[\s\S]*?<\/w:t>/gi).forEach((item) => {
    str += item.slice(5, -6);
  });
  // distPath = distPath || './dist/content.txt';
  fs.writeFile(distPath, str, (err) => {
    if (err) throw err;
  });
}