var path = require('path');

module.exports = {
  mainTemplate: 'templates/main.html',
  controllersDir: path.join(__dirname,  '../controllers/'),
  viewsDir: path.join(__dirname, '../views/') 
}