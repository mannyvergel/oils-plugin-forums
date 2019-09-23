'use strict';

exports.formatDateSince = function(date) {

    let seconds = Math.floor((new Date() - date) / 1000);

    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) {
    	let str = "y";
    	// if (interval > 1) {
    	// 	str += "s";
    	// }
        return interval + str;
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
    	let str = "mo";
    	// if (interval > 1) {
    	// 	str += "s";
    	// }
        return interval + str;
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
    	let str = "d";
    	// if (interval > 1) {
    	// 	str += "s";
    	// }
        return interval + str;
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
    	let str = "h";
    	// if (interval > 1) {
    	// 	str += "s";
    	// }
        return interval + str;
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
    	let str = "m";
    	// if (interval > 1) {
    	// 	str += "s";
    	// }
        return interval + str;
    }


	let str = "s";
	// if (seconds > 1) {
	// 	str += "s";
	// }

    return Math.floor(seconds) + str;
}