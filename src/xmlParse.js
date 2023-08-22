const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");

function parseXml(xmlDataStr, options) {
  options = options || {
    ignoreAttributes: false,
    attributeNamePrefix : "@_",
    allowBooleanAttributes: true
  };
  const parser = new XMLParser(options);
  const output = parser.parse(xmlDataStr);
  return output;
}
function createXml(XMLdata) {
  const parser = new XMLParser();
  let jObj = parser.parse(XMLdata);
  const builder = new XMLBuilder();
  const xmlContent = builder.build(jObj);
  return xmlContent;
}

module.exports = {
  parseXml,
  createXml
}