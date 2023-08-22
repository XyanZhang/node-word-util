exports.strongTag = function(isStrong, text) {
  if(isStrong) {
    return `<strong>${text}</strong>`
  }else {
    return text
  }
}