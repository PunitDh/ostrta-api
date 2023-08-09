const Winner = require("./Winner");

class Round {
  constructor() {
    this.moves = [];
    this.winner = new Winner();
  }
}

module.exports = Round;
