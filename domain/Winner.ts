class Winner {
  playerId: string | null;
  firstName: string | null;
  lastName: string | null;
  method: string | null;
  reason: string | null;

  constructor({
    playerId = null,
    firstName = null,
    lastName = null,
    method = null,
    reason = null,
  }: {
    playerId?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    method?: string | null;
    reason?: string | null;
  } = {}) {
    this.playerId = playerId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.method = method;
    this.reason = reason;
  }
}

export default Winner;
