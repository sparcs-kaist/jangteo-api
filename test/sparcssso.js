/* jshint expr: true */
var should = require('should');
var Client = require('./../server/util/sparcssso.js');

describe('sparcssso', function() {
  var testClient = new Client(true);
  describe('test suite', function() {
    it('return valid login url', function() {
      var result = 'https://sparcssso.kaist.ac.kr/api/v1/' +
        'token/require/?url=http://example.com/';
      testClient.getLoginUrl('http://example.com/').should.equal(result);
    });

    it('return valid user info', function() {
      //should.fail('', '', 'how to test this?');
    });

    it('throw during getting user\'s point', function() {
      (function() {
        testClient.getPoint('test');
      }).should.throw();
    });

    it('throw during setting user\'s point', function() {
      (function() {
        testClient.modifyPoint('test', 42, 'test', 0);
      }).should.throw();
    });

    it('does not throw during getting notices', function() {
      testClient.getNotice().should.not.throw();
    });
  });
});
