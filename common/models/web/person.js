var Client = require('../../../server/util/sparcssso');
var ssoClient = new Client(true);
var debug = require('debug')('loopback:person');
var errorHandler = require('../../../server/util/error-handler');
var loopback = require('loopback');

module.exports = function(Person) {
  'use strict';
  /**
   * Login a user by with the given `credentials`.
   *
   * ```js
   *    User.login(tokenid: 'aaaaaaaaaa', function (err, token) {
   *      console.log(token.id);
   *    });
   * ```
   *
   * @param {Object} tokenid of sparcssso
   * @callback {Function} callback Callback function
   * @param {Error} err Error object
   * @param {AccessToken} token Access token if login is successful
   */
  Person.loginCallback = function(tokenid, cb) {
    var info;
    ssoClient.getUserInfo(tokenid).then(function (_info) {
      info = _info;
      if(!info) {
        throw errorHandler.AuthorizationError('Login failed.');
      }
      var query = {
        sid: info.sid
      };
      return Person.findOne({where: query});
    }).then(function (person) {
      var now = new Date();
      var nowStr = now.toISOString().slice(0, 10);
      if (person) {
        return person.updateAttribute('lastUpdated', nowStr);
      } else {
        var newInfo = {
          sid: info.sid,
          nickname: 'NEED-TO-SET',
          contact: 'NEED-TO-SET',
          credit: 0,
          status: 'NEW',
          email: info.email,
          password: 'DuMMyPa55w0rD!',
          created: nowStr
        };
        return Person.create(newInfo);
      }
    }).then(function (person) {
      if (person.createAccessToken.length === 2) {
        person.createAccessToken(undefined, function(err, token) {
          if(err) {
            cb(err);
          }
          cb(null, token);
        });
      } else {
        person.createAccessToken(undefined, tokenid, function(err, token) {
          if(err) {
            cb(err);
          }
          cb(null, token);
        });
      }
    }).catch(function (err) {
      cb(err);
    });
  };
  Person.remoteMethod(
    'loginCallback',
    {
      description: 'Login a user with sparcssso tokenid.',
      accepts: [
        {
          arg: 'tokenid',
          type: 'string',
          required: true,
          http: {
            source: 'query'
          }
        },
      ],
      returns: {
        arg: 'accessToken', type: 'object', root: true,
        description:
        'The response body contains properties of the AccessToken created' +
        'on login.'
      },
      http: {verb: 'get'}
    }
  );
  Person.changeNickname = function(name, cb) {
    var person;
    var ctx = loopback.getCurrentContext();
    var accessToken = ctx.get('accessToken');
    if(!accessToken) {
      throw errorHandler.AuthorizationError('Invalid accessToken');
    }
    var personId = accessToken.userId;
    Person.findById(personId).then(function(_person) {
      person = _person;
      if (!person) {
        throw errorHandler.AuthorizationError('Login failed');
      }
      var app = require('../../../server/server');
      var nicknameHistory = app.models.NicknameHistory;
      var query = {
        nickname: name
      };
      return nicknameHistory.find({where: query});
    }).then(function (nicknameHistories) {
      if(nicknameHistories.length) {
        throw errorHandler.ValidationError('Nickname already exists');
      }
      return person.updateAttribute('nickname', name);
    }).then(function (_person) {
      var now = new Date();
      var nowStr = now.toISOString().slice(0, 10);
      var newNickname = {
        nickname: name,
        time: nowStr,
      };
      return person.nicknameHistories.create(newNickname);
    }).then(function (nicknameHistory) {
      cb(null, nicknameHistory);
    }).catch(function(err) {
      cb(err);
    });
  };
  Person.remoteMethod(
    'changeNickname',
    {
      description: 'Change the nickname of user.',
      accepts: [
        {
          arg: 'name',
          type: 'string',
          required: true
        }
      ],
      returns: {
        arg: 'nicknameHistory',
        type: 'object'
      }
    }
  );
};
