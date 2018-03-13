exports.formatDateSince = function(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval >= 1) {
    	var str = " year";
    	if (interval > 1) {
    		str += "s";
    	}
        return interval + str;
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
    	var str = " month";
    	if (interval > 1) {
    		str += "s";
    	}
        return interval + str;
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
    	var str = " day";
    	if (interval > 1) {
    		str += "s";
    	}
        return interval + str;
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
    	var str = " hour";
    	if (interval > 1) {
    		str += "s";
    	}
        return interval + str;
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
    	var str = " minute";
    	if (interval > 1) {
    		str += "s";
    	}
        return interval + str;
    }


	var str = " second";
	if (seconds > 1) {
		str += "s";
	}

    return Math.floor(seconds) + str;
}