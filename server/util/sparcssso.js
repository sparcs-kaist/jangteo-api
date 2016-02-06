var Q = require('q');
var rp = require('request-promise');


// SPARCS SSO Client Version 0.1.0 (ALPHA)
// VALID ONLY AFTER 2016-01-28T12:59+09:00
// Made by SPARCS SSO Team


if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] !== 'undefined' ? args[number] : match;
    });
  };
}


var Client = function(isTest, appName, secretKey) {
  var API_BASE_URL = 'https://sparcssso.kaist.ac.kr/api/v1/';
  var REQUIRE_BASE_URL = '{0}token/require/'.format(API_BASE_URL);
  var INFO_BASE_URL = '{0}token/info/'.format(API_BASE_URL);
  var POINT_BASE_URL = '{0}point/'.format(API_BASE_URL);
  var NOTICE_BASE_URL = '{0}notice/'.format(API_BASE_URL);

  this.isTest = typeof isTest !== 'undefined' ? isTest : false;
  this.appName = appName;
  this.secretKey = secretKey;

  var postData = function(uri, data) {
    return rp({
      method: 'POST',
      uri: uri,
      form: data
    })
    .then(function (body) {
      return JSON.parse(body);
    })
    .catch(function (reason) {
      if (reason.statusCode === 403)
        throw new Error('SSO_INVALID_SECRET_KEY');
      else if (reason.statusCode === 404)
        throw new Error('SSO_INVALID_TOKEN');
      throw new Error('SSO_UNKNOWN');
    });
  };

  var getData = function(url) {
    return rp({
      url: url,
      method: 'GET',
      json: true
    })
    .then(function (json) {
        return json;
    })
    .catch(function (reason) {
        throw new Error('SSO_UNKNOWN');
    });
  };

  this.getLoginUrl = function(callbackUrl) {
    if (this.isTest && !callbackUrl)
      throw new Error('SSO_CALLBACK_NEED');

    if (this.isTest)
      return '{0}?url={1}'.format(REQUIRE_BASE_URL, callbackUrl);
    return '{0}?app={1}'.format(REQUIRE_BASE_URL, this.appName);
  };

  this.getUserInfo = function(tokenid) {
    return postData(INFO_BASE_URL,
             {
               'tokenid': tokenid,
               'key': this.secretKey
             });
  };

  this.getPoint = function(sid) {
    if (this.isTest)
      throw new Error('SSO_NOT_SUPPORTED_ON_TEST');
    else
      return postData(POINT_BASE_URL,
                      {
                        'app': this.appName,
                        'key': this.secretKey,
                        'sid': sid
                      })
                      .then(function (data) {
                        return data['point'];
                      });
  };

  this.modifyPoint = function(sid, delta, action, lowerBound) {
    if (this.isTest)
      throw new Error('SSO_NOT_SUPPORTED_ON_TEST');
    else
      lowerBound = typeof lowerBound !== 'undefined' ? lowerBound
                                                     : -100000000;
      return postData(POINT_BASE_URL,
               {
                 'app': this.appName,
                 'key': this.secretKey,
                 'sid': sid,
                 'delta': delta,
                 'action': action,
                 'lower_bound': lowerBound
               })
               .then(function (data) {
                 return data['changed'], data['point'];
               });
  };

  this.getNotice = function() {
    return getData(NOTICE_BASE_URL);
  };
};

module.exports = Client;
