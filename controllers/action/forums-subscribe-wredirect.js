'use strict';


module.exports = {
  get: [web.auth.loginUtils.handleLogin, async function(req, res) {

    const reqParams = req.query;
    const listId = reqParams.listId;
    const email = req.user.email;
    const r = reqParams.r;

    await web.huhumails.subscribe({
      emails: [email],
      listIds: [listId]
    })

    console.log("Subscribed", email, listId);

    req.flash('info', "Thanks for subscribing!");

    res.redirect(r);

  }]
}