const Forum = web.models('ForumsForum');

module.exports = {
  get: function(req, res) {
    Forum.find({}).limit(2).exec(function(err, forums) {
      if (err) {
        throw err;
      }

      if (!forums) {
        throw new Error("Forum not found.");
      }

      if (forums.length == 1) {
        res.redirect('/forums/' + forums[0].forumId);
      } else {
        //TODO: make configurable
        throw new Error("Cannot redirect with " + forums.length + " forums.");
      }
    })
  }
}