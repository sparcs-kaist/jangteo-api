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
      console.log(query);
      return Person.findOne({where: query});
    }).then(function (person) {
      var now = new Date();
      var nowStr = now.toISOString().slice(0, 10);
      console.log(nowStr);
      console.log(person);
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
        console.log('create');
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
        }
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
  /**
   * Check validation of nickname for attribute updates
   * triggered by PUT People/:id (id is user id of authenticated user)
   *
   */
  Person.beforeRemote('prototype.updateAttributes', function(ctx, person, next) {
    var nickname = ctx.args.data.nickname;
    if (nickname) {
      var query = {
        nickname: nickname
      };
      var app = require('../../../server/server');
      var nicknameHistory = app.models.NicknameHistory;
      nicknameHistory.find({where: query}).then(function(nicknameHistories) {
        if (nicknameHistories.length) {
          var err = new Error('Nickname already exists');
          err.statusCode = 422;
          next(err);
        } else {
          next();
        }
      })
    } else {
      next();
    }
  });
  /**
   * Triggered by after update. If user updated nickname properly,
   * create new nickname history model
   */
  Person.afterRemote('prototype.updateAttributes', function(ctx, person, next) {
    var nickname = ctx.args.data.nickname;
    if (nickname) {
      var now = new Date();
      var newNickname = {
        nickname: nickname,
        time: now
      };
      person.nicknameHistories.create(newNickname).then(function(nicknameHistory){
        next();
      }).catch(function(err){
        next(err);
      });
    } else {
      next();
    }
  });
  Person.afterRemoteError('prototype.updateAttributes', function(ctx, next){
    console.log(ctx.error);  //for debugging
    next();
  });
};
