import _ from 'lodash';
import {
  GameArea,
  GameStatus,
  MafiaGameState,
  PlayerID,
  Teams,
  TimeOfDay,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';
export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';

export type MafiaEvents = GameEventTypes & {
  playerAliveChanged: (playersAlive: PlayerID[]) => void;
  turnChanged: (isPlayerTurn: boolean) => void;
  phaseChanged: (currentPhase: TimeOfDay) => void;
};

export default class MafiaAreaController extends GameAreaController<MafiaGameState, MafiaEvents> {
  protected _mafiaGamePlayersAlive: PlayerID[] = [];

  /*
   * Returns the players who are alive alive.
   */
  get playersAlive(): PlayerID[] {
    return this._mafiaGamePlayersAlive;
  }

  /**
   * Returns the count of players with the role 'Villager' who are alive.
   */
  get villagerAlive(): number {
    if (this._model.game?.state.villagers) {
      return this._model.game.state.villagers.filter(
        villager => villager && villager.status === 'Active',
      ).length;
    }
    return 0;
  }

  /**
   * Returns the count of players with the role 'Mafia' who are alive.
   */
  get mafiasAlive(): integer {
    if (this._model.game?.state.mafia) {
      return this._model.game.state.mafia.filter(mafia => mafia && mafia.status === 'Active')
        .length;
    }
    return 0;
  }

  /**
   * Returns one if the player with the role 'Doctor' is alive, else return a zero
   */
  get doctorAlive(): number {
    // Check if the doctor is defined and alive in the game state
    if (this._model.game?.state.doctor?.status === 'Active') {
      return 1;
    }
    return 0;
  }

  /**
   * Returns one if the player with the role 'Police' is alive, else return a zero
   */
  get policeAlive(): integer {
    // Check if the doctor is defined and alive in the game state
    if (this._model.game?.state.police?.status === 'Active') {
      return 1;
    }
    return 0;
  }

  /**
   * Returns the total count of players at the beginning of the game.
   */
  get startCountPlayer(): number {
    const totalVillagers =
      this._model.game?.state.villagers?.filter(villager => villager !== undefined).length || 0;
    const totalMafias =
      this._model.game?.state.mafia?.filter(mafia => mafia !== undefined).length || 0;
    const doctor = 1;
    const police = 1;
    return totalVillagers + totalMafias + doctor + police;
  }

  /**
   * Returns the total count of deceased players.
   */
  get totalDeceasedPlayers(): number {
    const totalCount = this.startCountPlayer;
    const alivePlayerCount =
      this.villagerAlive + this.mafiasAlive + this.doctorAlive + this.policeAlive;

    return totalCount - alivePlayerCount;
  }

  /**
   * Returns the current phase, day or night.
   */
  get currentPhase(): TimeOfDay {
    return this._model.game?.state.phase || 'Day';
  }

  /**
   * Returns players' role
   */
  get role(): 'Mafia' | 'Doctor' | 'Police' | 'Villager' {
    const playerId = this._townController.ourPlayer.id;
    if (this._model.game?.state.mafia?.some(mafia => mafia?.id === playerId)) {
      return 'Mafia';
    } else if (this._model.game?.state.doctor?.id === playerId) {
      return 'Doctor';
    } else if (this._model.game?.state.police?.id === playerId) {
      return 'Police';
    } else {
      return 'Villager';
    }
  }

  /**
   * Determines if it's the player's turn based on the game phase and player role.
   */
  get isPlayerTurn(): boolean {
    const currentPhase = this.currentPhase;
    const playerId = this._townController.ourPlayer.id;
    const playerRole = this.role;

    // Is player alive
    if (!this._mafiaGamePlayersAlive.includes(playerId)) {
      return false;
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
    return this._model.game?.state.winnerTeam;
  }

  /**
   * Returns the winners of the game
   */
  get winners(): PlayerController[] {
    const winners = this._model.game?.state.winners;
    const winnerList: PlayerController[] = [];
    if (winners) {
      winners.forEach(winnerId => {
        const winner = this.occupants.find(eachOccupant => eachOccupant.id === winnerId);
        if (winner) {
          winnerList.push(winner);
        }
      });
    }
    return winnerList;
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

  get isPlayer(): boolean {
    return this._model.game?.players.includes(this._townController.ourPlayer.id) || false;
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
    const pastPhase = this.currentPhase;
    const pastPhaseTurn = this.isPlayerTurn;
    super._updateFrom(newModel);
    const newState = newModel.game;
    if (newState) {
      const newMafiaGamePlayersAlive: PlayerID[] = [];
      // Check and add villagers, mafia, doctor, and police that are alive
      newState.state.villagers?.forEach(villager => {
        if (villager && villager.status === 'Active') {
          newMafiaGamePlayersAlive.push(villager.id);
        }
      });
      newState.state.mafia?.forEach(mafia => {
        if (mafia && mafia.status === 'Active') {
          newMafiaGamePlayersAlive.push(mafia.id);
        }
      });
      if (newState.state.doctor?.status === 'Active') {
        newMafiaGamePlayersAlive.push(newState.state.doctor.id);
      }
      if (newState.state.police?.status === 'Active') {
        newMafiaGamePlayersAlive.push(newState.state.police.id);
      }
      if (!_.isEqual(newMafiaGamePlayersAlive, this._mafiaGamePlayersAlive)) {
        this._mafiaGamePlayersAlive = newMafiaGamePlayersAlive;
        this.emit('playerAliveChanged', this._mafiaGamePlayersAlive);
      }
    }
    const currentPhaseTurn = this.isPlayerTurn;
    if (pastPhaseTurn != currentPhaseTurn) this.emit('turnChanged', this.isPlayerTurn);
    const currentPhase = this.currentPhase;
    if (pastPhase != currentPhase) this.emit('phaseChanged', currentPhase);
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
}
