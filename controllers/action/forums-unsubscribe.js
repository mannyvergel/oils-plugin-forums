'use strict';

// TODO: obsolete? Use subscribe w param
module.exports = {
  get: [web.auth.loginUtils.handleLogin, async function(req, res) {

    const reqParams = req.query;
    const listId = reqParams.listId;
    const email = req.user.email;

    await web.huhumails.unsubscribe({
      emails: [email],
      listIds: [listId]
    })

    res.status(200).json({status: 200});

    console.log("Unsubscribed", email, listId);
  }]
}