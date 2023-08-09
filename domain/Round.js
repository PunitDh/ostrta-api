class Round {
  constructor() {
    this.moves = [];
    this.winner = {
      method: null,
      reason: null,
      playerId: null,
      firstName: null,
      lastName: null,
    };
  }
}

module.exports = Round;
