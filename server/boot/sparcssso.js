var request = require('request');


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

    var postData = function(url, data) {
        var result = {};
        request({
            url: url,
            mehthod: 'POST',
            form: data
        }, function(error, resp, body) {
            if (error)
                throw new Error('SSO_UNKNOWN');
            else if (resp.statusCode === 403)
                throw new Error('SSO_INVALID_SECRET_KEY');
            else if (resp.statusCode === 404)
                throw new Error('SSO_INVALID_TOKEN');
            else if (resp.statusCode !== 200)
                throw new Error('SSO_UNKNOWN');
            result = JSON.parse(body);
        });
        return result;
    };

    this.getLoginUrl = function(callbackUrl) {
        if (this.isTest && !callbackUrl)
            throw new Error('SSO_CALLBACK_NEED');

        if (this.isTest)
            return '{0}?url={1}'.format(REQUIRE_BASE_URL, callbackUrl);
        return '{0}?app={1}'.format(REQUIRE_BASE_URL, this.appName);
    };

    this.getUserInfo = function(tokenid) {
        var result = postData(INFO_BASE_URL,
                           {
                               'tokenid': tokenid,
                               'key': this.secretKey
                           });
        return result;
    };

    this.getPoint = function(sid) {
        if (this.isTest)
            throw new Error('SSO_NOT_SUPPORTED_ON_TEST');

        var result = postData(POINT_BASE_URL,
                           {
                               'app': this.appName,
                               'key': this.secretKey,
                               'sid': sid
                            });
        return result['point'];
    };

    this.modifyPoint = function(sid, delta, action, lowerBound) {
        if (this.isTest)
            throw new Error('SSO_NOT_SUPPORTED_ON_TEST');
        
        lowerBound = typeof lowerBound !== 'undefined' ?
                     lowerBound : -100000000;
        var result = postData(POINT_BASE_URL,
                           {
                               'app': this.appName,
                               'key': this.secretKey,
                               'sid': sid,
                               'delta': delta,
                               'action': action,
                               'lower_bound': lowerBound
                           });
        return result['changed'], result['point'];
    };

    this.getNotice = function() {
        var result = {};
        request({
            url: NOTICE_BASE_URL,
            mehthod: 'GET',
        }, function(error, resp, body) {
            if (error || resp.statusCode !== 200)
                throw new Error('SSO_UNKNOWN');
            result = JSON.parse(body);
        });
        return result;
    };
};

module.exports = Client;
