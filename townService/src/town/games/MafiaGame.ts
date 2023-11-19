import Game from './Game';
import { GameMove, MafiaGameState, VoteMove } from '../../types/CoveyTownSocket';
import Player from '../../lib/Player';
import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
/**
 * A MafiaGame is a Game that implements the rules of Mafia.
 */
export default class MafiaGame extends Game<MafiaGameState, VoteMove> {
  public constructor() {
    super({
      moves: [],
      status: 'WAITING_TO_START',
    });
  }

  /**
   * A helper function to roll a dice.
   * The maximum is inclusive and the minimum is inclusive.
   */
  private _getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * A helper function to randomly assign a player to one of the Roles in the Mafia Game.
   * @param player The player that will be assigned a role in the game
   * @returns nothing. Only used for role assignment and updating the game state to reflect the role assignment.
   */
  private _randomlyAssignRoleTo(player: Player): void {
    let diceRoll: number;
    let roleAssigned = false;
    let minDiceNumber = 1;
    let maxDiceNumber = 4;
    if (this._players.length < 6) {
      while (!roleAssigned) {
        diceRoll = this._getRandomIntInclusive(minDiceNumber, maxDiceNumber);
        if (diceRoll === 1 && !this.state.police) {
          this.state.police = player.id;
          roleAssigned = true;
        }
        if (diceRoll === 2 && !this.state.doctor) {
          this.state.doctor = player.id;
          roleAssigned = true;
        }
        if (diceRoll === 3 && this.state.villagers) {
          if (!this.state.villagers[0]) {
            this.state.villagers[0] = player.id;
            roleAssigned = true;
          }
          if (!this.state.villagers[1]) {
            this.state.villagers[1] = player.id;
            roleAssigned = true;
          }
        }
        if (diceRoll === 4 && this.state.mafias) {
          if (!this.state.mafias[0]) {
            this.state.mafias[0] = player.id;
            roleAssigned = true;
          }
          if (!this.state.mafias[1]) {
            this.state.mafias[1] = player.id;
            roleAssigned = true;
          }
        }
      }
    }
    if (this._players.length < 10) {
      minDiceNumber = 1;
      maxDiceNumber = 2;
      while (!roleAssigned) {
        diceRoll = this._getRandomIntInclusive(minDiceNumber, maxDiceNumber);
        if (diceRoll === 1 && this.state.villagers) {
          if (!this.state.villagers[2]) {
            this.state.villagers[2] = player.id;
            roleAssigned = true;
          }
          if (!this.state.villagers[3]) {
            this.state.villagers[3] = player.id;
            roleAssigned = true;
          }
        }
        if (diceRoll === 2 && this.state.mafias) {
          if (!this.state.mafias[2]) {
            this.state.mafias[2] = player.id;
            roleAssigned = true;
          }
        }
      }
    }
  }

  /**
   * Applies a player's move to the game. In this game a move would be a vote.
   */
  public applyMove(move: GameMove<VoteMove>): void {}

  /**
   * Adds a player to the game
   * Updates the game's state to reflect the new player.
   * Once the first player joins the game, updates the game's status to 'WAITING_TO_START'.
   * If the game is now full (has 10 players), updates the game's state to set the status to IN_PROGRESS.
   * @param player The player to join the game.
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
   * or the game is full (GAME_FULL_MESSAGE)
   */
  public _join(player: Player): void {
    if (this._players.includes(player)) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (this._players.length === 0) {
      this._randomlyAssignRoleTo(player);
      this.state.status = 'WAITING_TO_START';
    }
    if (this._players.length < 6) {
      this._randomlyAssignRoleTo(player);
    }
    if (this._players.length === 10) {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
  }

  /**
   * Removes a player from the game.
   */
  public _leave(player: Player): void {

  }
}
