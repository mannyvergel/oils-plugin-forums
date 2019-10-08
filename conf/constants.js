'use strict';

module.exports = {
	viewExpiryInSeconds: 86400, //1 day
	viewType: {
		topic: 'TOPIC',
		category: 'CAT'
	},
	activeUsersCount: 10,
  titleSlugCharLimit: 80,
  indexTab: {
    latest: {desc: 'Latest', id: 'latest', link:'/forums/tab/latest'},
    mostviewed: {desc: 'Most Viewed', id: 'mostviewed', link:'/forums/tab/mostviewed'},
    categories: {desc: 'Categories', id: 'categories', link:'/forums/tab/categories'},
  }

}