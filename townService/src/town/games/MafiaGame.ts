import Game from './Game';
import { GameMove, MafiaGameState, PlayerID, MafiaMove } from '../../types/CoveyTownSocket';
import Player from '../../lib/Player';
import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';

/**
 * A helper function to roll a dice.
 * The maximum is inclusive and the minimum is inclusive.
 */
function getRandomIntInclusive(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
/**
 * A MafiaGame is a Game that implements the rules of Mafia.
 */
export default class MafiaGame extends Game<MafiaGameState, MafiaMove> {
  public constructor() {
    super({
      moves: [],
      status: 'WAITING_TO_START',
    });
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
        diceRoll = getRandomIntInclusive(minDiceNumber, maxDiceNumber);
        if (diceRoll === 1 && !this.state.police) {
          this.state.police = {
            id: player.id,
            status: 'Active',
          };
          roleAssigned = true;
        }
        if (diceRoll === 2 && !this.state.doctor) {
          this.state.doctor = {
            id: player.id,
            status: 'Active',
          };
          roleAssigned = true;
        }
        if (diceRoll === 3 && this.state.villagers) {
          if (!this.state.villagers[0]) {
            this.state.villagers[0] = {
              id: player.id,
              status: 'Active',
            };
            roleAssigned = true;
          }
          if (!this.state.villagers[1]) {
            this.state.villagers[1] = {
              id: player.id,
              status: 'Active',
            };
            roleAssigned = true;
          }
        }
        if (diceRoll === 4 && this.state.mafias) {
          if (!this.state.mafias[0]) {
            this.state.mafias[0] = {
              id: player.id,
              status: 'Active',
            };
            roleAssigned = true;
          }
          if (!this.state.mafias[1]) {
            this.state.mafias[1] = {
              id: player.id,
              status: 'Active',
            };
            roleAssigned = true;
          }
        }
      }
    } else {
      minDiceNumber = 1;
      maxDiceNumber = 2;
      while (!roleAssigned) {
        diceRoll = getRandomIntInclusive(minDiceNumber, maxDiceNumber);
        if (diceRoll === 1 && this.state.villagers) {
          if (!this.state.villagers[2]) {
            this.state.villagers[2] = {
              id: player.id,
              status: 'Active',
            };
            roleAssigned = true;
          }
          if (!this.state.villagers[3]) {
            this.state.villagers[3] = {
              id: player.id,
              status: 'Active',
            };
            roleAssigned = true;
          }
        }
        if (diceRoll === 2 && this.state.mafias) {
          if (!this.state.mafias[2]) {
            this.state.mafias[2] = {
              id: player.id,
              status: 'Active',
            };
            roleAssigned = true;
          }
        }
      }
    }
  }

  /**
   * A helper function that iterates over the array of current Mafia team members
   *  and checks if all Mafia members are 'Deceased'
   * @returns boolean value
   */
  private _allMafiaIsDead(): boolean {
    let playerIndex: number;
    if (this.state.mafias) {
      for (playerIndex = 0; playerIndex < this.state.mafias?.length; playerIndex += 1) {
        if (this.state.mafias[playerIndex]?.status === 'Active') {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * A helper function that updates the status of the WinnableGameState winnerTeam value
   * @return void
   */
  /*
  private _setWinnerTeam(): void {
    //TODO: Acutally Implement this/replace it with a check game ending function. This was put here to appease prettier.
  }
  */

  /**
   * A helper function that iterates over array of current game players
   * @call to _allMafiaIsDead() helper method
   * If all mafia team members player status is 'Deceased',
   * @returns an array of all winning civilian PlayerID and doctor PlayerID and police PlayerID
   * else:
   * @returns an array of all mafia members PlayerID
   */
  private _getWinningTeam(): PlayerID[] {
    let playerIndex: number;
    const winningTeam: PlayerID[] = [];
    if (this._allMafiaIsDead() && this.state.doctor && this.state.police && this.state.villagers) {
      winningTeam.push(this.state.doctor?.id);
      winningTeam.push(this.state.police?.id);
      for (playerIndex = 0; playerIndex < this.state.villagers?.length; playerIndex += 1) {
        winningTeam.push(this.state.villagers[playerIndex].id);
      }
    }
    if (this.state.mafias) {
      for (playerIndex = 0; playerIndex < this.state.mafias.length; playerIndex += 1) {
        winningTeam.push(this.state.mafias[playerIndex].id);
      }
    }
    return winningTeam;
  }

  /**
   * Applies a player's move to the game. In this game a move would be a vote.
   */
  public applyMove(move: GameMove<MafiaMove>): void {
    this._validateMove(/* TODO: Use move here */);
    this._applyMove(move.move);
  }

  private _validateMove(/* move: MafiaMove */) {
    // TODO: Use move in this function.
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
  }

  private _applyMove(move: MafiaMove): void {
    this.state = {
      ...this.state,
      moves: [...this.state.moves, move],
    };
    // this._checkForGameEnding(); TODO: IMPLEMNENT
  }

  /*
  private _checkForGameEnding() {
    // TODO: Implement
  }
  */

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
   * Updates the game's state to reflect the player leaving.
   * If the game has at least 6 players in it at the time of call to this method,
   *   updates the game's status to OVER and sets the winner to the other team.
   * @param player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   */
  public _leave(player: Player): void {
    let currentGameStatus = this.state.status;
    const minNumberOfPlayers = 6;
    // const maxNumberOfPlayers = 10;
    if (!this._players.includes(player)) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (this._players.length === minNumberOfPlayers && currentGameStatus === 'IN_PROGRESS') {
      currentGameStatus = 'OVER';
      this.state.winners = this._getWinningTeam();
    }
    if (this.state.status === 'OVER') {
      // this._setWinnerTeam(); TODO Implement this function so it can get used here.
    }
  }
}
