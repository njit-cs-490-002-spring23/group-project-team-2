/**
 * constant variables to represent common game messages
 */
export const GAME_FULL_MESSAGE = 'Game is full';
export const GAME_NOT_IN_PROGRESS_MESSAGE = 'Game is not in progress';
export const GAME_OVER_MESSAGE = 'Game is over';
export const GAME_ID_MISSMATCH_MESSAGE = 'Game ID mismatch';
export const GAME_NOT_ENOUGH_PLAYERS = 'Game does not have the required number of players';
/**
 * invalid move messages
 */
export const PLAYER_ALREADY_VOTED_MESSAGE = 'Player already casted a vote';
export const MOVE_NOT_YOUR_TURN_MESSAGE = 'Not your turn';
export const PLAYER_ALREADY_VOTED_OUT_MESSAGE = 'Player is already voted out of the game.';
export const PLAYER_ALREADY_DEAD_MESSAGE = 'Player already killed by mafia in previous round.';
/**
 * invalid player messages
 */
export const PLAYER_NOT_IN_GAME_MESSAGE = 'Player is not in this game';
export const PLAYER_ALREADY_IN_GAME_MESSAGE = 'Player is already in this game';
export const INVALID_COMMAND_MESSAGE = 'Invalid command';
export const INVALID_MOVE_MESSAGE = 'Invalid move';

export default class InvalidParametersError extends Error {
  public message: string;

  public constructor(message: string) {
    super(message);
    this.message = message;
  }
}
