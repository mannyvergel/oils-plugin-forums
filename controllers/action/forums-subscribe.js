'use strict';


module.exports = {
  get: [web.auth.loginUtils.handleLogin, async function(req, res) {

    const reqParams = req.query;
    const listId = reqParams.listId;
    const email = req.user.email;

    await web.huhumails.subscribe({
      emails: [email],
      listIds: [listId]
    })

    res.status(200).json({status: 200});

  }]
}