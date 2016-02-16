var app = require('../server');

exports.ValidationError = ValidationError;

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
