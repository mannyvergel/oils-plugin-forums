
module.exports = function(url) {
	return function(req, res, next) {
		//TODO: find a way to forward to express js
		//request js didn't work because of different cookies
		//next('$url') didn't work, as well as req.url = '$url'; next();
		res.redirect(url)
		if (web.conf.isDebug) {
			console.debug('Forwarding to', url, 'from', req.url);
		}
	}
}