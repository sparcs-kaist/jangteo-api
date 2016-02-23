var app = require('./server');
var _ = require('lodash');

var db = app.dataSources.db;

(function () {
  function migrateBuiltinModels() {
    var appModels = ['User', 'AccessToken', 'ACL', 'RoleMapping', 'Role'];
    db.isActual(appModels, function (err, actual) {
      if (!actual) {
        db.autoupdate(appModels, function (err) {
          if (err) throw err;
        });
      }
      console.log('Built-in model migration success');
    });
  }

  function migrateCustomModels() {
    var customModels = ['Person', 'NicknameHistory'];
    db.isActual(customModels, function (err, actual) {
      if (!actual) {
        db.autoupdate(customModels, function (err) {
          if (err) throw err;
        });
      }
      console.log('Custom model migration success');
    });
  }
  migrateBuiltinModels();
  migrateCustomModels();
})();
