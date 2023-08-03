class Round {
  constructor() {
    this.moves = [];
    this.winner = {
      playerId: null,
      firstName: null,
      lastName: null,
      method: null,
      reason: null,
    };
  }
}

module.exports = Round;
