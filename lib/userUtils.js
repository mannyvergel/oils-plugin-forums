exports.getEmailsFromUserIds = async function(userIds) {
  const User = web.models('User');
  // const arrEmail = [];
  // for (let userId of userIds) {
  //   let user = await User.findOne({_id: userId}).lean().exec();
  //   arrEmail.push(user.email);
  // }

  let users = await User.find({_id: {$in: userIds}}).lean().exec();
  return users.map(rec => rec.email);
}