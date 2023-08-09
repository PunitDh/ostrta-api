class Winner {
  constructor({
    playerId = null,
    firstName = null,
    lastName = null,
    method = null,
    reason = null,
  } = {}) {
    this.playerId = playerId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.method = method;
    this.reason = reason;
  }
}

module.exports = Winner;
