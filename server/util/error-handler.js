var app = require('../server');

exports.ValidationError = ValidationError;
exports.NotFoundError = NotFoundError;
exports.AuthorizationError = AuthorizationError;

function ValidationError(message) {
  if (!message) {
    message = '';
  }
  var error = new Error();
  error.message = message;
  error.status = 422;

  return error;
}

function NotFoundError(message) {
  if (!message) {
    message = '';
  }
  var error = new Error();
  error.message = message;
  error.status = 404;

  return error;
}

function AuthorizationError(message) {
  if (!message) {
    message = '';
  }
  var error = new Error();
  error.message = message;
  error.status = 401;

  return error;
}
