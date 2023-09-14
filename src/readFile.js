const fs = require('fs');
const path = require('path');
const directoryPath = path.resolve(__dirname, '../input');

module.exports = function readSyncFromDir() {
  let firstFilePath = ''
  try {
    const files = fs.readdirSync(directoryPath);

    if (files.length === 0) {
      console.log('Directory is empty');
      return;
    }

    const firstFile = files[0];
    firstFilePath = path.join(directoryPath, firstFile);

    console.log('First file:', firstFilePath);
  } catch (err) {
    console.log('Error reading directory:', err);
  }
  return firstFilePath;
}