//TODO: might not be needed.
module.exports = {
	get: function(req, res) {
		if (req.defaultForum) {
			//eg /admin/forums/categories/add -> /admin/forums/default-forum/categories/add
			var urlRedirect = req.url.substr(0, req.url.indexOf('forums') + 6) 
			  + '/' + req.defaultForum.forumId 
			  + req.url.substr(req.url.indexOf('forums') + 6);

			console.log('Redirecting to default forum', urlRedirect);
			res.redirect(urlRedirect);
		} else {
			throw new Error("Default forum not found. [1]");
		}
	}
}