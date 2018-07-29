
module.exports = {
	get: function(req, res) {
		let modelStr = 'ForumsCategory';
		//should be in cache by this time (assumption)
		//let model = dbeditUtils.searchModel(modelStr);
		let model = web.models(modelStr);
		let modelAttr = model.getModelDictionary();
		let modelSchema = modelAttr.schema;
		let modelName = modelAttr.name;
		let modelConf = {cols: ['forum', 'name', 'desc'], labels:['Forum', 'Name', 'Descrip']};

		let cols = ['name', 'desc'];
		let labels = ['Name', 'Descrip'];
		let labels = modelConf.labels;
		
		let handlers = modelConf.handlers;
		if (!handlers) {
			handlers = {
			  	_id: function(record, column, escapedVal, callback) {
					callback(null, ['<a href="/admin/dbedit/save?model=' + modelName + '&_id=' + escapedVal + '"><i class="fa fa-pencil fa-fw dbedit" style=""></i></a>', 
						'<a onclick="return confirm(\'Do you want to delete this record?\')" href="/admin/dbedit/delete?model=' + modelName + '&_id=' + escapedVal + '&redirectAfter=/admin/dbedit/list?model=' + modelName + '"><i class="fa fa-remove fa-fw dbedit" style="color: red;"></i></a>']
						.join(' '));
				}
			  };
		}
		

		let query = modelConf.query || {}; //else query everything
		web.renderTable(req, model, {
			  query: query,
			  columns: cols,
			  labels: labels,
			  handlers: handlers
			}, 
			function(err, table) {
				let listView = modelConf.view || web.cms.dbedit.conf.listView;
				let pageTitle = modelConf.pageTitle || (modelName + ' List');
				res.render(listView, {table: table, pageTitle: pageTitle, modelName: modelName});
		});
	}
}