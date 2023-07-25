class Message {
  constructor(request, response) {
    this.request = request;
    this.response = response;
  }
}

function message(request, response) {
  return new Message(request, response);
}

module.exports = {
  Message,
  message,
};
