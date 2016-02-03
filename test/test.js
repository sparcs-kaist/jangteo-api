/* jshint expr: true */
var should = require('should');
var Client = require('./../server/boot/sparcssso.js')

describe('example', function() {
  describe('example suite', function() {
    it('should be like this', function() {
      true.should.be.true;
    });
  });
});

describe('sparcssso', function() {
    test_client = new Client(is_test=true);
    describe('test suite', function() {
        it('return valid login url', function() {
            test_client.get_login_url('http://example.com/').should.equal('https://sparcssso.kaist.ac.kr/api/v1/token/require/?url=http://example.com/');
        });

        it('return valid user info', function() {
            should.fail('', '', 'how to test this?');
        });

        it('throw during getting user\'s point', function() {
            (function() { test_client.get_point('test'); }).should.throw();
        });

        it('throw during setting user\'s point', function() {
            (function() { test_client.modify_point('test', 42, 'test', 0); }).should.throw();
        });

        it('does not throw during getting notices', function() {
            test_client.get_notice().should.not.throw();
        });
    });
});
