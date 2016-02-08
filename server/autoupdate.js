var app = require('./server');
var _ = require('lodash');

var db = app.dataSources.db;
var appModels = ['User', 'AccessToken', 'ACL', 'RoleMapping', 'Role'];

db.isActual(appModels, function(err, actual) {
  if (!actual) {
    db.autoupdate(appModels, function(err) {
      if (err) throw err;
    });
  }
  console.log('Built-in model migration success');
});

var customModels = ['Person', 'nickname-history'];

db.isActual(customModels, function(err, actual) {
  if(!actual) {
    db.autoupdate(customModels, function(err) {
      if (err) throw err;
    });
  }
  console.log('Custom model migration success');
});

