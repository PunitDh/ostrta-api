import Winner from "./Winner";
class Round {
  moves: any[];
  winner: any;

  constructor() {
    this.moves = [];
    this.winner = new Winner();
  }
}

export default Round;
