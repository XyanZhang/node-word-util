exports.strongTag = function(isStrong, text) {
  if(isStrong) {
    return `<strong>${text}</strong>`
  }else {
    return text
  }
}
exports.aTag = function(isA, text) {
  if(isA) {
    return `<a href="${text}" target="_blank">${text}</a>`
  }else {
    return text
  }
}