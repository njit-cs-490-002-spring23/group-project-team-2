import Game from "./Game";
import {GameMove, MafiaGameState, VoteMove} from "../../types/CoveyTownSocket";
import Player from "../../lib/Player";
import InvalidParametersError, { GAME_FULL_MESSAGE, PLAYER_ALREADY_IN_GAME_MESSAGE } from "../../lib/InvalidParametersError";
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
   * 
   * A helper function to check if a player exists in the game.
   * @param player The player to check if they already exists in the current list of players in the Mafia game.
   * @returns boolean
   */
  private _playerInGame(player: Player): boolean {
    let playerIndex: number;
    for (playerIndex = 0; playerIndex < this._players.length; playerIndex += 1) {
      if (player.id === this._players[playerIndex].id) {
        return true;
      }
    }
    return false;
  }
  /**
   * A helper function to roll a dice.
   * The maximum is inclusive and the minimum is inclusive.
   */
  private _getRandomIntInclusive(): number {
    let min = 1;
    let max = 6; 
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
    if (this._players.length <= 6) {
      let roleAssigned = false;
      let diceRoll;
      while (!roleAssigned) {
        diceRoll = this._getRandomIntInclusive();
        if (diceRoll === 1 && this.state.police !== undefined) {
          this.state.police = player.id;
        }
        if (diceRoll === 2 && this.state.doctor !== undefined) {
          this.state.doctor = player.id;
        }
        if (diceRoll === 3 && this.state.villagers[0] !== undefined) {
          
        }
        if (diceRoll === 4 && this.state.villagers[1] !== undefined) {

        }
        if (diceRoll === 5 && this.state.mafias[0] !== undefined) {

        }
        if (diceRoll === 6 && this.state.mafias[1] !== undefined) {

        }
      }
    }
  }
  /**
   * Applies a player's move to the game. In this game a move would be a vote.
   */
  public applyMove(move: GameMove<VoteMove>): void {
    
  }
  /**
   * Adds a player to the game
   * Updates the game's state to reflect the new player.
   * If the game is now full (has at least 6 players), updates the game's state to set the status to IN_PROGRESS.
   * 
   * @param player The player to join the game.
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
   * or the game is full (GAME_FULL_MESSAGE)
   */
  public _join(player: Player): void {
    if (this._playerInGame(player)) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (this._players.length === 8) {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }


  }
  /**
   * Removes a player form the game.
   */
  public _leave(player: Player): void {
      
  }
}