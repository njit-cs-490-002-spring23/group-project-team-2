export const INVALID_MOVE_MESSAGE = 'Invalid move';
export const INVALID_COMMAND_MESSAGE = 'Invalid command';
export default class InvalidParametersError extends Error {
  public message: string;

  public constructor(message: string) {
    super(message);
    this.message = message;
  }
}
