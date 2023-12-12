import Game from './Game';
import { GameMove, MafiaGameState, PlayerID, PlayerState, MafiaMove } from '../../types/CoveyTownSocket';
import Player from '../../lib/Player';
import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
  GAME_NOT_ENOUGH_PLAYERS,
} from '../../lib/InvalidParametersError';

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
    if (this._roleCheck(playerid) === 'Doctor' && this.state.doctor?.status === 'Active') {
      return true;
    }
    if (this._roleCheck(playerid) === 'Police' && this.state.police?.status === 'Active') {
      return true;
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
        if (
          this.state.villagers[villagerIndex].id === playerid &&
          this.state.villagers[villagerIndex].status === 'Active'
        ) {
          return true;
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

  /**
   * Used to get the count of players taht are alive in said team
   * @param team Mafia or Civilian team to check count
   * @returns The number of players that are alive on the given team
   */
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
    const newMoves = this.state.moves.filter(oldMove => oldMove.playerVoting !== playerid);
    this.state.moves = newMoves;
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

  /**
   * Starts the game when the required number of players is met.
   */
  public _startGame(): void {
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
            round: 1,
          };
        }
      }
    } else {
      throw new InvalidParametersError(GAME_NOT_ENOUGH_PLAYERS);
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

  /**
   * Applies a player's move to the game. In this game a move would be a vote.
   */
  public applyVotes(): void {
    let playerMostVoted = '';
    const playersVotes: { [id: PlayerID]: number } = {};
    let max = 0;
    let doctorVote = '';
    // check if day or night phase.
    const isNightPhase = this.state.phase === 'Night';
    // check who the doctor voted for
    if (isNightPhase) {
      this.state.moves.forEach(move => {
        if (this.state.doctor?.id === move.playerVoting) {
          doctorVote = move.playerVoted;
        }
      });
      // check who the police investigated
      this.state.moves.forEach(move => {
        if (this.state.police?.id === move.playerVoting) {
          if (!this.state.investigation) {
            this.state.investigation = [];
          }
          this.state.investigation.push(move.playerVoted);
        }
      });
      // add to round
      const oldRound = this.state.round;
      if (oldRound) {
        this.state = {
          ...this.state,
          round: oldRound + 1,
        };
      }
    }
    // find who mafia voted for
    const votes = isNightPhase
      ? this.state.moves
          .filter(move => this._roleCheck(move.playerVoting) === 'Mafia')
          .map(move => move.playerVoted)
      : this.state.moves.map(move => move.playerVoted) ?? [];
    for (const player of votes) {
      playersVotes[player] = (playersVotes[player] || 0) + 1;
      if (max < playersVotes[player]) {
        max = playersVotes[player];
        playerMostVoted = player;
      }
    }

    this.state.mafia?.forEach(mafia => {
      if (mafia.id === playerMostVoted && mafia.id !== doctorVote) {
        mafia.status = 'Spectator';
      }
    });
    this.state.villagers?.forEach(villager => {
      if (villager.id === playerMostVoted && villager.id !== doctorVote) {
        villager.status = 'Spectator';
      }
    });
    if (this.state.doctor?.id === playerMostVoted && this.state.doctor.id !== doctorVote) {
      this.state.doctor.status = 'Spectator';
    }
    if (this.state.police?.id === playerMostVoted && this.state.police?.id !== doctorVote) {
      this.state.police.status = 'Spectator';
    }
    // change phase
    if (this.state.phase === 'Day') {
      this.state = {
        ...this.state,
        phase: 'Night',
      };
    } else if (this.state.phase === 'Night') {
      this.state = {
        ...this.state,
        phase: 'Day',
      };
    }
    // clear the votes
    this.state = {
      ...this.state,
      moves: [],
    };
    // check for game ending condtions
    this._checkForGameEnding();
  }
}
