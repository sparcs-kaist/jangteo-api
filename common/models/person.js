var Client = require('./../../server/util/sparcssso.js');
var ssoClient = new Client(true);
var debug = require('debug')('loopback:person');

function createPromiseCallback() {
  var cb;
  var promise = new Promise(function(resolve, reject) {
    cb = function(err, data) {
      if (err) return reject(err);
      return resolve(data);
    };
  });
  cb.promise = promise;
  return cb;
}

module.exports = function(Person) {
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

  Person.loginCallback = function(tokenid, fn) {
    var self = this;
    fn = fn || createPromiseCallback();

    ssoClient.getUserInfo(tokenid)
    .then(function (info) {
      var query = {'sid': info.sid};
      
      self.findOne({where: query}, function(err, person) {
        var defaultError = new Error('login failed');
        defaultError.statusCode = 401;
        defaultError.code = 'LOGIN_FAILED';

        if (err) {
          debug('An error is reported from Person.findOne: %j', err);
          fn(defaultError);
        } else if (person) {
          if (person.createAccessToken.length === 2) {
            person.createAccessToken(undefined, fn);
          } else {
            person.createAccessToken(undefined, tokenid, fn);
          }
        } else {
          debug('No matching record is found for person %s', query.username);
          // signup here!
          fn(defaultError);
        }
      });
      return fn.promise;
    })
    .catch(function (err) {
      err.statusCode = 401;
      err.code = 'SSO_CONNECTION_FAILED';
      fn(err);
      return fn.promise;
    });
  };

  Person.setup = function() {
    // We need to call the base class's setup method
    Person.base.setup.call(this);
    var PersonModel = this;

    PersonModel.remoteMethod(
      'loginCallback',
      {
        description: 'Login a user with sparcssso tokenid.',
        accepts: [
          {arg: 'tokenid', type: 'string', required: true, http: 
          {source: 'query'}},
        ],
        returns: {
          arg: 'accessToken', type: 'object', root: true,
          description:
          'The response body contains properties of the AccessToken created' + 
          'on login.\n'
        },
        http: {verb: 'get'}
      }
    );
  };
  
  Person.setup();
};
