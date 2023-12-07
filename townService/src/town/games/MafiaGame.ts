import Game from './Game';
import { GameMove, MafiaGameState, PlayerID, PlayerState, MafiaMove } from '../../types/CoveyTownSocket';
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
      spectators: [],
      police: [],
      doctors: [],
      villagers: [],
      mafia: [],
    });
  }

  /**
   * A helper function to assign a player to one of the Roles in the Mafia Game.
   */
  private _assignRoleTo(player: Player, role: number) {
    if (role === 1) {
      this.state.police.push({
        id: player.id,
        status: 'Active',
      });
      return;
    } else if (role === 2) {
      this.state.doctors.push ({
        id: player.id,
        status: 'Active',
      });
      return;
    } else if (role === 3) {
      this.state.villagers.push({
        id: player.id,
        status: 'Active',
      });
      return;
    } else if (role === 4) {
      this.state.mafia.push({
        id: player.id,
        status: 'Active',
      });
      return;
    }
    throw new Error('Role could not be assigned.');
  }

  /**
   * A helper function to randomly assign a each player to one of the Roles in the Mafia Game.
   */
  private _randomlyAssignRoles() {
    this.state.villagers = [];
    this.state.mafia = [];
    const availableIndexes: number[] = [];
    const roles = [1, 2, 3, 4, 3, 4, 3, 4, 3, 4] // Numbers representing the roles and the order they would be selected.
    
    // Creating a list of indexes that can be pulled from.
    for (let i = 0; i < this._players.length; i++)
      availableIndexes.push(i);

    for (let i = 0; i < this._players.length; i++) {
      const index = getRandomIntInclusive(0, availableIndexes.length - 1)
      this._assignRoleTo(this._players[index], roles[i]);
      availableIndexes.splice(index, 1);
    }
  }

  /**
   * A helper function to find an remove players from the various arrays in the game state.
   * @param players 
   * @param player 
   * @returns boolean
   */
  private _foundAndRemovedPlayer(players: PlayerState[], player: PlayerID): boolean {
    let index = -1;
    for (let i = 0; i < players.length; i++)
      if (players[i].id === player) {
        index = i;
        break;
      }
    if (index === -1) return false;
    players.splice(index, 1);
    return true;
  }

  /**
   * A helper function that iterates over the array of current Mafia team members
   *  and checks if all Mafia members are 'Deceased'
   * @returns boolean value
   */
  private _allMafiaIsDead(): boolean {
    let playerIndex: number;
    if (this.state.mafia) {
      for (playerIndex = 0; playerIndex < this.state.mafia?.length; playerIndex += 1) {
        if (this.state.mafia[playerIndex]?.status === 'Active') {
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
    if (this._allMafiaIsDead() && this.state.doctors && this.state.police && this.state.villagers) {
      //winningTeam.push(this.state.doctors?.id);
      //winningTeam.push(this.state.polices?.id);
      for (playerIndex = 0; playerIndex < this.state.villagers?.length; playerIndex += 1) {
        winningTeam.push(this.state.villagers[playerIndex].id);
      }
    }
    if (this.state.mafia) {
      for (playerIndex = 0; playerIndex < this.state.mafia.length; playerIndex += 1) {
        winningTeam.push(this.state.mafia[playerIndex].id);
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
    if (this.state.spectators.includes({id: player.id, status: 'Spectator'})) throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    this.state.spectators.push({id: player.id, status: 'Spectator'});
    /*
    if (this.state.spectators.length > 5 && this.state.status === 'WAITING_TO_START') {
      this.state.status = 'IN_PROGRESS';
      this._randomlyAssignRoles();
    }
    */
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
    if (this._foundAndRemovedPlayer(this.state.spectators, player.id)) {}
    else if (this._foundAndRemovedPlayer(this.state.police, player.id)) {}
    else if (this._foundAndRemovedPlayer(this.state.doctors, player.id)) {}
    else if (this._foundAndRemovedPlayer(this.state.villagers, player.id)) {}
    else if (this._foundAndRemovedPlayer(this.state.mafia, player.id)) {}
    else throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    /*
    if (this._players.length === minNumberOfPlayers && currentGameStatus === 'IN_PROGRESS') {
      currentGameStatus = 'OVER';
      this.state.winners = this._getWinningTeam();
    }
    */
    if (this.state.status === 'OVER') {
      // this._setWinnerTeam(); TODO Implement this function so it can get used here.
    }
  }
}
