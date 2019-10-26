'use strict';


module.exports = {
  get: async function(req, res) {

    if (!req.user) {
      res.status(200).json({
        status: 200,
        data: {
          isSubscribed: 'N'
        }
      });
      return;
    }

    const reqParams = req.query;
    const listId = reqParams.listId;
    const email = req.user.email;

    const isSubscribed = await web.huhumails.isSubscribed({
      listId,
      email
    })

    res.json({
      status: 200,
      data: {
        isSubscribed: isSubscribed ? 'Y': 'N',
      }
    })

  }
}