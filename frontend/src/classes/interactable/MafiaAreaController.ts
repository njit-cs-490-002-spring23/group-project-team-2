import _ from 'lodash';
import {
  GameArea,
  GameStatus,
  MafiaGameState,
  PlayerID,
  Teams,
  TimeOfDay,
  PlayerState,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';
export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';

export type MafiaEvents = GameEventTypes & {
  boardChanged: (board: string[]) => void;
  turnChanged: (isPlayerTurn: boolean) => void;
  phaseChanged: (currentPhase: TimeOfDay) => void;
  roundChanged: (currentRound: number | undefined) => void;
  statusChanged: (status: GameStatus) => void;
};

export default class MafiaAreaController extends GameAreaController<MafiaGameState, MafiaEvents> {
  protected _board: string[] = [];

  /*
   * Returns the players who are alive alive.
   */
  get board(): string[] {
    return this._board;
  }

   /**
   * Returns the players that are spectators
   */
  get spectators(): PlayerController[] {
    const spectators = this._model.game?.state.spectators;
    if (spectators && spectators.length > 0) {
      const spectatorIDs = spectators.map(spectator => spectator.id)
      return this.occupants.filter(eachOccupant => spectatorIDs.includes(eachOccupant.id));
    }
    return [];
  }

  /**
   * Returns the player with the 'Police' role, if there is one, or undefined otherwise
   */
  get police(): PlayerController[] | undefined {
    const police = this._model.game?.state.police;
    if (police && police.length > 0) {
      const policeIDs = police.map(mafia => mafia.id)
      return this.occupants.filter(eachOccupant => policeIDs.includes(eachOccupant.id));
    }
    return [];
  }

  /**
   * Returns the player with the 'Doctor' role, if there is one, or undefined otherwise
   */
  get doctor(): PlayerController[] | undefined {
    const doctor = this._model.game?.state.doctors;
    if (doctor && doctor.length > 0) {
      const doctorIDs = doctor.map(doctors => doctors.id)
      return this.occupants.filter(eachOccupant => doctorIDs.includes(eachOccupant.id));
    }
    return [];
  }

  /**
   * Returns the players with the 'Mafia' role, if there is one, or undefined otherwise
   */
  get mafia(): PlayerController[] | undefined {
    const mafia = this._model.game?.state.mafia;
    if (mafia && mafia.length > 0) {
      const mafiaIDs = mafia.map(mafia => mafia.id);
      return this.occupants.filter(eachOccupant => mafiaIDs.includes(eachOccupant.id));
    }
    return [];
  }

  /**
   * Returns the players with the 'Villagers' role, if there is one, or undefined otherwise
   */
  get villagers(): PlayerController[] | undefined {
    const villagers = this._model.game?.state.villagers;
    if (villagers && villagers.length > 0) {
      const villagerIDs = villagers.map(villager => villager.id);
      return this.occupants.filter(eachOccupant => villagerIDs.includes(eachOccupant.id));
    }
    return undefined;
  }

  /**
   * Returns the count of players with the role 'Villager' who are alive.
   */
  get villagerAlive(): number {
    if (this._model.game?.state.villagers) {
      return this._model.game.state.villagers.filter(villager => villager.status === 'Active')
        .length;
    }
    return 0;
  }

  /**
   * Returns the count of players with the role 'Mafia' who are alive.
   */
  get mafiasAlive(): integer {
    if (this._model.game?.state.mafia) {
      return this._model.game.state.mafia.filter(mafia => mafia.status === 'Active').length;
    }
    return 0;
  }

  /**
   * Returns one if the player with the role 'Doctor' is alive, else return a zero
   */
  get doctorAlive(): number {
    // Check if the doctor is defined and alive in the game state
    if (this._model.game?.state.doctors) {
      return this._model.game.state.doctors.filter(doctor => doctor.status === 'Active').length;
    }
    return 0;
  }

  /**
   * Returns one if the player with the role 'Police' is alive, else return a zero
   */
  get policeAlive(): integer {
    // Check if the doctor is defined and alive in the game state
    if (this._model.game?.state.police) {
      return this._model.game.state.police.filter(police => police.status === 'Active').length;
    }
    return 0;
  }

  get currentRound(): number | undefined {
    return this._model.game?.state?.round;
  }

  /**
   * Returns the current phase, day or night.
   */
  get currentPhase(): TimeOfDay {
    if (this._model.game?.state?.status === 'IN_PROGRESS') {
      return this._model.game?.state?.phase;
    }
    return undefined;
  }

  /**
   * Returns players' role
   */
  get role(): 'Mafia' | 'Doctor' | 'Police' | 'Villager' | 'Spectator' {
    const playerID = this._townController.ourPlayer.id;
    if (this._model.game?.state.villagers?.some(villager => villager.id === playerID)) {
      return 'Villager';
    } else if (this._model.game?.state.mafia?.some(mafia => mafia?.id === playerID)) {
      return 'Mafia';
    } else if (this._model.game?.state.doctors?.some(doctor => doctor.id === playerID)) {
      return 'Doctor';
    } else if (this._model.game?.state.police?.some(police => police.id === playerID)) {
      return 'Police';
    } else {
      return 'Spectator';
    }
  }

  /**
   * Returns players' role
   */
  get investigation(): string[] {
    const investigation = this._model.game?.state.investigation;
    if (investigation) {
      return investigation;
    }
    return [];
  }

  /**
   * Determines if it's the player's turn based on the game phase and player role.
   */
  get isPlayerTurn(): boolean {
    const currentPhase = this.currentPhase;
    const playerId = this._townController.ourPlayer.id;
    const playerRole = this.role;
    if (this._model.game?.state.status !== 'IN_PROGRESS') {
      return false;
    }
    // first day check
    if (this.currentRound === 1 && this.currentPhase === 'Day') {
      return false;
    }
    if (playerRole === 'Mafia') {
      const player = this._model.game?.state.mafia?.find(mafia => mafia?.id === playerId);
      if (player?.status === 'Spectator') {
        return false;
      }
    } else if (playerRole === 'Villager') {
      const player = this._model.game?.state.villagers?.find(villager => villager?.id === playerId);
      if (player?.status === 'Spectator') {
        return false;
      }
    } else if (playerRole === 'Doctor') {
      const player = this._model.game?.state.doctors?.find(doctor => doctor?.id === playerId);;
      if (player?.status === 'Spectator') {
        return false;
      }
    } else if (playerRole === 'Police') {
      const player = this._model.game?.state.police?.find(police => police?.id === playerId);;
      if (player?.status === 'Spectator') {
        return false;
      }
    }
    if (currentPhase === 'Day') {
      return true;
    } else {
      if (playerRole === 'Mafia' || playerRole === 'Doctor' || playerRole === 'Police') {
        return true;
      }
      return false;
    }
  }

  /**
   * Returns Winner Team
   */
  get winnerTeam(): Teams | undefined {
    return this._model.game?.state?.winnerTeam;
  }

  /**
   * Returns the winners of the game
   */
  get winners(): PlayerController[] | undefined {
    const winners = this._model.game?.state?.winners;
    const winnerList: PlayerController[] = [];
    if (this._model.game?.state?.status === 'OVER' && winners) {
      winners.forEach(winnerId => {
        const winner = this.occupants.find(eachOccupant => eachOccupant.id === winnerId);
        if (winner) {
          winnerList.push(winner);
        }
      });
      return winnerList;
    }
    return undefined;
  }

  /**
   * Returns the status of the game.
   * Defaults to 'WAITING_TO_START' if the game is not in progress
   */
  get status(): GameStatus {
    if (this._model.game?.state.status === 'IN_PROGRESS') {
      return 'IN_PROGRESS';
    }
    if (this._model.game?.state.status === 'OVER') {
      return 'OVER';
    }
    return 'WAITING_TO_START';
  }

  /**
   * Returns true if the current player is a player in this game
   */
  get isPlayer(): boolean {
    return this._model.game?.players.includes(this._townController.ourPlayer.id) || false;
  }

  /**
   * Checks if the current player is the first player that joined
   * @returns Return true if the current player is the first player that joined the game
   */
  public firstPlayer(): boolean {
    if (this._model.game?.players[0] === this._townController.ourPlayer.id) {
      return true;
    }
    return false;
  }

  /**
   * Returns true if the game is in progress
   */
  public isActive(): boolean {
    return this._model.game?.state.status === 'IN_PROGRESS';
  }

  /**
   * Updates the internal state of this MafiaAreaController to match the new model.
   *
   * Calls super._updateFrom, which updates the occupants of this game area and
   * other common properties (including this._model).
   * If the turn has changed, emits a 'turnChanged' event with true if it is our turn, and false otherwise.
   * If the turn has not changed, does not emit the event.
   */

  protected _updateFrom(newModel: GameArea<MafiaGameState>): void {
    const pastRound = this.currentRound;
    const pastStatus = this.status;
    const pastPhase = this.currentPhase;
    const pastTurn = this.isPlayerTurn;
    super._updateFrom(newModel);
    const newState = newModel.game;
    if (newState) {
      const newBoard: PlayerID[] = [];
      newState.state.villagers?.forEach(villager => {
        if (villager.status === 'Active') {
          newBoard.push(villager.id);
        }
      });

      newState.state.mafia?.forEach(mafia => {
        if (mafia.status === 'Active') {
          newBoard.push(mafia.id);
        }
      });
      newState.state.police?.forEach(police => {
        if (police.status === 'Active') {
          newBoard.push(police.id);
        }
      });
      newState.state.doctors?.forEach(doctor => {
        if (doctor.status === 'Active') {
          newBoard.push(doctor.id);
        }
      });
      if (newBoard !== this._board) {
        this._board = newBoard;
        this.emit('boardChanged', this._board);
      }
    }
    const currentTurn = this.isPlayerTurn;
    if (!_.isEqual(pastTurn, currentTurn)) {
      this.emit('turnChanged', this.isPlayerTurn);
    }
    const currentPhase = this.currentPhase;
    if (!_.isEqual(pastPhase, currentPhase)) {
      this.emit('phaseChanged', currentPhase);
    }
    const currentStatus = this.status;
    if (!_.isEqual(pastStatus, currentStatus)) {
      this.emit('statusChanged', currentStatus);
    }
    const currentRound = this.currentRound;
    if (!_.isEqual(pastRound, currentRound)) {
      this.emit('roundChanged', currentRound);
    }
  }

  /**
   * Sends a request to the server to make a move in the game.
   * Uses the this._townController.sendInteractableCommand method to send the request.
   * The request should be of type 'GameMove',
   * and send the gameID provided by `this._instanceID`.
   *
   * If the game is not in progress, throws an error NO_GAME_IN_PROGRESS_ERROR
   *
   */
  public async makeMove(name: PlayerID) {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.game?.state.status !== 'IN_PROGRESS') {
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    }
    await this._townController.sendInteractableCommand(this.id, {
      type: 'GameMove',
      gameID: instanceID,
      move: {
        playerVoting: this._townController.ourPlayer.id,
        playerVoted: name,
      },
    });
  }

  /**
   * Sends a request to the server to count the votes and Eliminate a player.
   * Uses the this._townController.sendInteractableCommand method to send the request.
   * The request should be of type 'countVotes',
   * and send the gameID provided by `this._instanceID`.
   *
   * If the game is not in progress, throws an error NO_GAME_IN_PROGRESS_ERROR
   *
   */
  public async countVotes() {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.game?.state.status !== 'IN_PROGRESS') {
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    }
    await this._townController.sendInteractableCommand(this.id, {
      type: 'countVotes',
      gameID: instanceID,
    });
  }
}
