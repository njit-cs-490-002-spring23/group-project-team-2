import Game from './Game';
import { GameMove, MafiaGameState, PlayerID, MafiaMove, Teams } from '../../types/CoveyTownSocket';
import Player from '../../lib/Player';
import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
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
  private _randomlyAssignRole(): void {
    const players = this._players;
    let roles: number[];
    switch (players.length) {
      case 6:
        roles = [1, 1, 2, 2, 3, 4];
        break;
      case 7:
        roles = [1, 1, 1, 2, 2, 3, 4];
        break;
      case 8:
        roles = [1, 1, 1, 2, 2, 2, 3, 4];
        break;
      case 9:
        roles = [1, 1, 1, 1, 2, 2, 2, 3, 4];
        break;
      case 10:
        roles = [1, 1, 1, 1, 1, 2, 2, 2, 3, 4];
        break;
      default:
        roles = [1];
    }
    for (let rolesIndex = roles.length - 1; rolesIndex > 0; rolesIndex--) {
      const random = Math.floor(Math.random() * (rolesIndex + 1));
      [roles[rolesIndex], roles[random]] = [roles[random], roles[rolesIndex]];
    }
    for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
      switch (roles[playerIndex]) {
        case 1:
          if (!this.state.villagers) {
            this.state.villagers = [];
          }
          this.state.villagers.push({
            id: players[playerIndex].id,
            status: 'Active',
          });
          break;
        case 2:
          if (!this.state.mafia) {
            this.state.mafia = [];
          }
          this.state.mafia.push({
            id: players[playerIndex].id,
            status: 'Active',
          });
          break;
        case 3:
          if (!this.state.doctor) {
            this.state.doctor = {
              id: players[playerIndex].id,
              status: 'Active',
            };
          }
          break;
        case 4:
          if (!this.state.police) {
            this.state.police = {
              id: players[playerIndex].id,
              status: 'Active',
            };
          }
          break;
        default:
          break;
      }
    }
  }

  /**
   * Takes player's id to check against the different roles to determine what role they are playing.
   * @param playerid Takes the player's id.
   * @returns The role which the player is playing
   */
  private _roleCheck(playerid: string) {
    if (this.state.doctor?.id === playerid) {
      return 'Doctor';
    }
    if (this.state.police?.id === playerid) {
      return 'Police';
    }
    if (this.state.mafia) {
      for (let playerIndex = 0; playerIndex < this.state.mafia.length; playerIndex++) {
        if (this.state.mafia[playerIndex].id === playerid) {
          return 'Mafia';
        }
      }
    }
    if (this.state.villagers) {
      for (let playerIndex = 0; playerIndex < this.state.villagers.length; playerIndex++) {
        if (this.state.villagers[playerIndex].id === playerid) {
          return 'Villager';
        }
      }
    }
    return undefined;
  }

  /**
   * Check if the player is alive or dead.
   * @param playerid Takes player's id.
   * @returns True if the player is alive, false if the player is dead.
   */
  private _isPlayerAlive(playerid: string): boolean {
    if (this._roleCheck(playerid) === 'Doctor') {
      if (this.state.doctor?.status === 'Active') {
        return true;
      }
    }
    if (this._roleCheck(playerid) === 'Police') {
      if (this.state.police?.status === 'Active') {
        return true;
      }
    }
    if (this.state.mafia) {
      for (let mafiaIndex = 0; mafiaIndex < this.state.mafia.length; mafiaIndex++) {
        if (this.state.mafia[mafiaIndex].id === playerid) {
          if (this.state.mafia[mafiaIndex].status === 'Active') {
            return true;
          }
        }
      }
    }
    if (this.state.villagers) {
      for (let villagerIndex = 0; villagerIndex < this.state.villagers.length; villagerIndex++) {
        if (this.state.villagers[villagerIndex].id === playerid) {
          if (this.state.villagers[villagerIndex].status === 'Active') {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Checks whether a team is still alive or dead.
   * @param team The team you want to check if there is at least one player alive.
   * @returns True if there is at least one person alive on that team, False if no one on the team is alive.
   */
  private _isTeamAlive(team: Teams): boolean {
    if (team === 'MAFIAS_TEAM') {
      if (this.state.mafia) {
        for (let mafiaIndex = 0; mafiaIndex < this.state.mafia.length; mafiaIndex++) {
          if (this.state.mafia[mafiaIndex].status === 'Active') {
            return true;
          }
        }
      }
    }
    if (team === 'CIVILIANS_TEAM') {
      if (this.state.doctor?.status === 'Active') {
        return true;
      }
      if (this.state.police?.status === 'Active') {
        return true;
      }
      if (this.state.villagers) {
        for (let villagerIndex = 0; villagerIndex < this.state.villagers.length; villagerIndex++) {
          if (this.state.villagers[villagerIndex].status === 'Active') {
            return true;
          }
        }
      }
    }
    return false;
  }

  private _isTeamCount(team: Teams): number {
    let count = 0;
    if (team === 'MAFIAS_TEAM') {
      if (this.state.mafia) {
        for (let mafiaIndex = 0; mafiaIndex < this.state.mafia.length; mafiaIndex++) {
          if (this.state.mafia[mafiaIndex].status === 'Active') {
            count++;
          }
        }
      }
    }
    if (team === 'CIVILIANS_TEAM') {
      if (this.state.doctor?.status === 'Active') {
        count++;
      }
      if (this.state.police?.status === 'Active') {
        count++;
      }
      if (this.state.villagers) {
        for (let villagerIndex = 0; villagerIndex < this.state.villagers.length; villagerIndex++) {
          if (this.state.villagers[villagerIndex].status === 'Active') {
            count++;
          }
        }
      }
    }
    return count;
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
  private _getWinningTeam(): void {
    let playerIndex: number;
    const winningTeam: PlayerID[] = [];
    if (
      !this._isTeamAlive('MAFIAS_TEAM') &&
      this.state.doctor &&
      this.state.police &&
      this.state.villagers
    ) {
      winningTeam.push(this.state.doctor?.id);
      winningTeam.push(this.state.police?.id);
      for (playerIndex = 0; playerIndex < this.state.villagers?.length; playerIndex += 1) {
        winningTeam.push(this.state.villagers[playerIndex].id);
      }
    }
    if (this.state.mafia) {
      for (playerIndex = 0; playerIndex < this.state.mafia.length; playerIndex += 1) {
        winningTeam.push(this.state.mafia[playerIndex].id);
      }
    }
    this.state.winners = winningTeam;
  }

  /**
   * Checks for the ending of the game which means that every memeber of one team would be dead
   * and at least one memeber of the other team is alive.
   */
  private _checkForGameEnding(): void {
    if (this._isTeamAlive('CIVILIANS_TEAM') && !this._isTeamAlive('MAFIAS_TEAM')) {
      this.state.status = 'OVER';
      this._getWinningTeam();
      this.state.winnerTeam = 'CIVILIANS_TEAM';
    }
    if (this._isTeamCount('MAFIAS_TEAM') >= this._isTeamCount('CIVILIANS_TEAM')) {
      this.state.status = 'OVER';
      this._getWinningTeam();
      this.state.winnerTeam = 'MAFIAS_TEAM';
    }
  }

  /**
   * Checks that the move is valid, for example checks that the the player is voting someone that is not already dead, etc.
   * @param move The player's move that is trying to be applied.
   */
  private _validateMove(move: GameMove<MafiaMove>): void {
    // TODO: Use move in this function.
    const playerid = move.playerID;
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    for (let moveIndex = 0; moveIndex < this.state.moves.length; moveIndex++) {
      if (this.state.moves[moveIndex].playerVoting === playerid) {
        const newMoves = this.state.moves.filter(oldMove => oldMove.playerVoting !== playerid);
        this.state.moves = newMoves;
        break;
      }
    }
    if (this.state.phase === 'Night') {
      if (this._roleCheck(playerid) === 'Villager') {
        throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
      }
    }
  }

  private _applyMove(move: MafiaMove): void {
    this.state = {
      ...this.state,
      moves: [...this.state.moves, move],
    };
    this._checkForGameEnding();
  }

  /**
   * Applies a player's move to the game. In this game a move would be a vote.
   */
  public applyMove(move: GameMove<MafiaMove>): void {
    this._validateMove(move);
    this._applyMove(move.move);
  }

  public startGame(): void {
    if (this._players.length >= 6 && this._players.length <= 10) {
      this._randomlyAssignRole();
      if (this.state.mafia && this.state.villagers) {
        if (
          this.state.doctor &&
          this.state.police &&
          this.state.mafia?.length >= 2 &&
          this.state.villagers?.length >= 2
        ) {
          this.state = {
            ...this.state,
            status: 'IN_PROGRESS',
            phase: 'Day',
          };
        }
      }
    }
  }

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
    if (this._players.length >= 10) {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
    /**
     * this._randomlyAssignRoleTo(player);
    if (this.state.mafia && this.state.villagers) {
      if (
        this.state.doctor &&
        this.state.police &&
        this.state.mafia?.length >= 2 &&
        this.state.villagers?.length >= 2
      ) {
        this.state = {
          ...this.state,
          status: 'IN_PROGRESS',
          phase: 'Day',
        };
      }
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
    const minNumberOfPlayers = 6;
    // const maxNumberOfPlayers = 10;
    if (!this._players.includes(player)) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (this._players.length === minNumberOfPlayers && this.state.status === 'IN_PROGRESS') {
      this._checkForGameEnding();
    }
    if (this._players.length < minNumberOfPlayers && this.state.status !== 'IN_PROGRESS') {
      this.state.status = 'WAITING_TO_START';
    }
    if (this.state.status === 'IN_PROGRESS' && 'Mafia' && this._isTeamCount('MAFIAS_TEAM') === 1) {
      this.state.status = 'OVER';
      this.state.winnerTeam = 'CIVILIANS_TEAM';
    }
    if (this._roleCheck(player.id) === 'Mafia') {
      const leavingPlayer = this.state.mafia?.find(p => p.id === player.id);
      if (leavingPlayer) {
        leavingPlayer.status = 'Spectator';
      }
    }
    if (this._roleCheck(player.id) === 'Villager') {
      const leavingPlayer = this.state.villagers?.find(p => p.id === player.id);
      if (leavingPlayer) {
        leavingPlayer.status = 'Spectator';
      }
    }
    if (this._roleCheck(player.id) === 'Doctor') {
      if (this.state.doctor) {
        this.state.doctor.status = 'Spectator';
      }
    }
    if (this._roleCheck(player.id) === 'Police') {
      if (this.state.police) {
        this.state.police.status = 'Spectator';
      }
    }
  }
}
