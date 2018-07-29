const pluginConf = web.plugins['oils-plugin-forums'].conf;
const path = require('path');
const Category = web.models('ForumsCategory');

module.exports = {
  get: async function(req, res) {
		let categories = await Category.find({}).lean().sort({seq: 1}).exec();
    
		res.renderFile(path.join(pluginConf.viewsDir, 'forums-index.html'), 
			{categories: categories, pluginConf: pluginConf}); 

  }
}