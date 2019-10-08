const forumPlugin = web.plugins['oils-plugin-forums'];

// charLimit will find the nearest dash
exports.convertToSlug = function (str, charLimit) {

  let slugStr = str
    .toLowerCase()
    .replace(/[^\w ]+/g,'')
    .replace(/ +/g,'-')
    ;

  charLimit = charLimit || forumPlugin.conf.titleSlugCharLimit;

  if (charLimit) {
    let substr = slugStr.substr(0, charLimit);
    slugStr = slugStr.substr(0, substr.lastIndexOf('-'));
    
    if (web.stringUtils.isEmpty(slugStr)) {
      slugStr = substr;
    }
  }

  return slugStr;

}