var request = require('request')


// SPARCS SSO Client Version 0.1.0 (ALPHA)
// VALID ONLY AFTER 2016-01-28T12:59+09:00
// Made by SPARCS SSO Team


if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) { 
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
            ;
        });
    };
}


var Client = function(is_test, app_name, secret_key) {
    API_BASE_URL = 'https://sparcssso.kaist.ac.kr/api/v1/';
    REQUIRE_BASE_URL = '{0}token/require/'.format(API_BASE_URL);
    INFO_BASE_URL = '{0}token/info/'.format(API_BASE_URL);
    POINT_BASE_URL = '{0}point/'.format(API_BASE_URL);
    NOTICE_BASE_URL = '{0}notice/'.format(API_BASE_URL);

    this.is_test = typeof is_test !== 'undefined' ? is_test : false;
    this.app_name = app_name;
    this.secret_key = secret_key;

    post_data = function(url, data) {
        var result = {};
        request({
            url: url,
            mehthod: 'POST',
            form: data
        }, function(error, response, body) {
            if (error)
                throw new Error('SSO_UNKNOWN');
            else if (resp.statusCode == 403)
                throw new Error('SSO_INVALID_SECRET_KEY');
            else if (resp.statusCode == 404)
                throw new Error('SSO_INVALID_TOKEN');
            else if (resp.statusCode != 200)
                throw new Error('SSO_UNKNOWN');
            result = JSON.parse(body);
        });
        return result;
    };

    this.get_login_url = function(callback_url) {
        if (this.is_test && !callback_url)
            throw new Error('SSO_CALLBACK_NEED');

        if (this.is_test)
            return '{0}?url={1}'.format(REQUIRE_BASE_URL, callback_url);
        return '{0}?app={1}'.format(REQUIRE_BASE_URL, app_name);
    };

    this.get_user_info = function(tokenid) {
        result = post_data(INFO_BASE_URL,
                           {
                               'tokenid': tokenid,
                               'key': this.secret_key
                           });
        return result;
    };

    this.get_point = function(sid) {
        if (this.is_test)
            throw new Error('SSO_NOT_SUPPORTED_ON_TEST');

        result = post_data(POINT_BASE_URL,
                           {
                               'app': this.app_name,
                               'key': this.secret_key,
                               'sid': sid
                            });
        return result['point'];
    };

    this.modify_point = function(sid, delta, action, lower_bound) {
        if (this.is_test)
            throw new Error('SSO_NOT_SUPPORTED_ON_TEST');
        
        lower_bound = typeof lower_bound !== 'undefined' ? lower_bound : -100000000;
        result = post_data(POINT_BASE_URL,
                           {
                               'app': this.app_name,
                               'key': this.secret_key,
                               'sid': sid,
                               'delta': delta,
                               'action': action,
                               'lower_bound': lower_bound
                           });
        return result['changed'], result['point'];
    };

    this.get_notice = function() {
        var result = {};
        request({
            url: NOTICE_BASE_URL,
            mehthod: 'GET',
        }, function(error, response, body) {
            if (error || resp.statusCode != 200)
                throw new Error('SSO_UNKNOWN');
            result = JSON.parse(body);
        });
        return result;
    };
};

module.exports = Client
