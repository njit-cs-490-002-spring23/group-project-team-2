import assert from 'assert';
import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import {
  GameResult,
  GameStatus,
  PlayerState,
  Teams,
  TimeOfDay,
  MafiaMove,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import MafiaAreaController, { NO_GAME_IN_PROGRESS_ERROR } from './MafiaAreaController';

describe('[T1] MafiaAreaController', () => {
  const ourPlayer = new PlayerController(nanoid(), nanoid(), {
    x: 0,
    y: 0,
    moving: false,
    rotation: 'front',
  });
  const otherPlayers = [
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
  ];

  const mockTownController = mock<TownController>();
  Object.defineProperty(mockTownController, 'ourPlayer', {
    get: () => ourPlayer,
  });
  Object.defineProperty(mockTownController, 'players', {
    get: () => [ourPlayer, ...otherPlayers],
  });

  function mafiaGameControllerWithProp({
    _id,
    history,
    status,
    undefinedGame,
    moves,
    villagers,
    mafias,
    police,
    doctor,
    phase,
    winnerTeam,
  }: {
    _id?: string;
    history?: GameResult[];
    status?: GameStatus;
    undefinedGame?: boolean;
    moves?: MafiaMove[];
    villagers?: PlayerState[];
    mafias?: PlayerState[];
    police?: PlayerState;
    doctor?: PlayerState;
    phase?: TimeOfDay;
    winnerTeam?: Teams;
  }) {
    const id = _id || nanoid();
    const playerStates = [...(villagers || []), ...(mafias || [])];
    if (police) playerStates.push(police);
    if (doctor) playerStates.push(doctor);
    const playerIDs = playerStates.filter((p): p is PlayerState => p !== undefined).map(p => p.id);
    const ret = new MafiaAreaController(
      id,
      {
        id,
        occupants: playerIDs,
        history: history || [],
        type: 'MafiaArea',
        game: undefinedGame
          ? undefined
          : {
              id,
              players: playerIDs,
              state: {
                status: status || 'IN_PROGRESS',
                moves: moves || [],
                villagers: villagers,
                mafias: mafias,
                police: police,
                doctor: doctor,
                phase: phase || 'Day',
                winnerTeam: winnerTeam,
              },
            },
      },
      mockTownController,
    );
    if (playerIDs) {
      ret.occupants = playerIDs
        .map(eachID => mockTownController.players.find(eachPlayer => eachPlayer.id === eachID))
        .filter(eachPlayer => eachPlayer) as PlayerController[];
      mockTownController.getPlayer.mockImplementation(playerID => {
        const p = mockTownController.players.find(player => player.id === playerID);
        assert(p);
        return p;
      });
    }
    return ret;
  }
  describe('[T1.1]', () => {
    describe('isActive', () => {
      it('should return true if the game is in progress', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
        });
        expect(controller.isActive()).toBe(true);
      });
      it('should return false if the game is not in progress', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'OVER',
        });
        expect(controller.isActive()).toBe(false);
      });
    });
    describe('isPlayer', () => {
      it('should return true if the current player is a player in this game', () => {
        const villagers: PlayerState[] = [
          { id: ourPlayer.id, status: 'Active' },
          { id: otherPlayers[0].id, status: 'Active' },
        ];
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          villagers: villagers,
        });
        expect(controller.isPlayer).toBe(true);
      });
      it('should return false if the current player is not a player in this game', () => {
        const villagers: PlayerState[] = [
          { id: otherPlayers[0].id, status: 'Active' },
          { id: otherPlayers[1].id, status: 'Active' },
        ];
        const mafias: PlayerState[] = [
          { id: otherPlayers[2].id, status: 'Active' },
          { id: otherPlayers[3].id, status: 'Active' },
        ];
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          villagers: villagers,
          mafias: mafias,
        });
        expect(controller.isPlayer).toBe(false);
      });
    });
    describe('Role', () => {
      it('should return the role of the current player if the current player is a player in this game', () => {
        const villagers: PlayerState[] = [
          { id: ourPlayer.id, status: 'Active' },
          { id: otherPlayers[0].id, status: 'Active' },
        ];
        const doctor: PlayerState = { id: ourPlayer.id, status: 'Active' };
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          villagers: villagers,
        });
        expect(controller.role).toBe('Villager');
        const controller2 = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          doctor: doctor,
        });
        expect(controller2.role).toBe('Doctor');
      });
    });
    describe('status', () => {
      it('should return the status of the game', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
        });
        expect(controller.status).toBe('IN_PROGRESS');
      });
      it('should return WAITING_TO_START if the game is not defined', () => {
        const controller = mafiaGameControllerWithProp({
          undefinedGame: true,
        });
        expect(controller.status).toBe('WAITING_TO_START');
      });
    });
    describe('phase', () => {
      it('should return the default phase of the game initially', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
        });
        expect(controller.currentPhase).toBe('Day');
      });
      it('should return the correct phase of the game after a change', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          phase: 'Night',
        });
        expect(controller.currentPhase).toBe('Night');
      });
      it('should return Day if the phase is not explicitly set', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          // Phase not set
        });
        expect(controller.currentPhase).toBe('Day');
      });
    });
    describe('isPlayerTurn', () => {
      it('should return true during the day phase for any player', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          phase: 'Day',
          villagers: [
            { id: ourPlayer.id, status: 'Active' },
            { id: otherPlayers[0].id, status: 'Active' },
          ],
        });
        expect(controller.isPlayerTurn).toBe(true);
      });
      it('should return true during the night phase for Mafia, Doctor, and Police', () => {
        // Example for a Mafia role
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          phase: 'Night',
          mafias: [
            { id: ourPlayer.id, status: 'Active' },
            { id: otherPlayers[0].id, status: 'Active' },
          ],
        });
        expect(controller.isPlayerTurn).toBe(true);
      });
      it('should return false for a Villager during the night phase', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          phase: 'Night',
          villagers: [
            { id: ourPlayer.id, status: 'Active' },
            { id: otherPlayers[0].id, status: 'Active' },
          ],
        });
        expect(controller.isPlayerTurn).toBe(false);
      });
      it('should return false for a deceased player', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          phase: 'Day',
          villagers: [
            { id: ourPlayer.id, status: 'Spectator' },
            { id: otherPlayers[0].id, status: 'Active' },
          ],
        });
        expect(controller.isPlayerTurn).toBe(false);
      });
    });
    describe('totalDeceasedPlayers', () => {
      it('should return the correct number of deceased players', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          villagers: [
            { id: otherPlayers[0].id, status: 'Spectator' },
            { id: otherPlayers[1].id, status: 'Active' },
          ],
          mafias: [
            { id: otherPlayers[2].id, status: 'Spectator' },
            { id: otherPlayers[3].id, status: 'Active' },
          ],
          doctor: { id: otherPlayers[4].id, status: 'Spectator' },
          police: { id: ourPlayer.id, status: 'Active' },
        });
        expect(controller.totalDeceasedPlayers).toBe(3);
      });
      it('should return zero if no players are deceased', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          villagers: [
            { id: otherPlayers[0].id, status: 'Active' },
            { id: otherPlayers[1].id, status: 'Active' },
          ],
          mafias: [
            { id: otherPlayers[2].id, status: 'Active' },
            { id: otherPlayers[3].id, status: 'Active' },
          ],
          doctor: { id: otherPlayers[4].id, status: 'Active' },
          police: { id: ourPlayer.id, status: 'Active' },
        });
        expect(controller.totalDeceasedPlayers).toBe(0);
      });
    });
    describe('mafias', () => {
      it('should return the mafia players if there is one', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          mafias: [
            { id: ourPlayer.id, status: 'Active' },
            { id: otherPlayers[0].id, status: 'Active' },
          ],
        });
        const mafiaPlayers = controller.mafias;
        expect(mafiaPlayers).toContainEqual(ourPlayer);
      });
      it('should return undefined if there are no mafia players and the game is waiting to start', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'WAITING_TO_START',
        });
        expect(controller.mafias).toBe(undefined);
      });
      it('should return undefined if there are no mafia players', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          villagers: [{ id: otherPlayers[0].id, status: 'Active' }],
        });
        expect(controller.mafias).toBe(undefined);
      });
    });
    describe('villagers', () => {
      it('should return the villager players if there is one', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          villagers: [
            { id: ourPlayer.id, status: 'Active' },
            { id: otherPlayers[0].id, status: 'Active' },
          ],
        });
        const villagerPlayers = controller.villagers;
        expect(villagerPlayers).toContainEqual(ourPlayer);
      });
      it('should return undefined if there are no villager players and the game is waiting to start', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'WAITING_TO_START',
        });
        expect(controller.villagers).toBe(undefined);
      });
      it('should return undefined if there are no villager players', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          mafias: [{ id: otherPlayers[0].id, status: 'Active' }],
        });
        expect(controller.villagers).toBe(undefined);
      });
    });
    describe('police', () => {
      it('should return the police players if there is one', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          police: { id: ourPlayer.id, status: 'Active' },
        });
        const policePlayers = controller.police;
        expect(policePlayers).toEqual(ourPlayer);
      });
      it('should return undefined if there are no police player and the game is waiting to start', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'WAITING_TO_START',
        });
        expect(controller.villagers).toBe(undefined);
      });
      it('should return undefined if there are no police players', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          mafias: [{ id: otherPlayers[0].id, status: 'Active' }],
        });
        expect(controller.police).toBe(undefined);
      });
    });
    describe('doctor', () => {
      it('should return the doctor players if there is one', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          doctor: { id: ourPlayer.id, status: 'Active' },
        });
        const doctorPlayers = controller.doctor;
        expect(doctorPlayers).toEqual(ourPlayer);
      });
      it('should return undefined if there are no doctor player and the game is waiting to start', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'WAITING_TO_START',
        });
        expect(controller.villagers).toBe(undefined);
      });
      it('should return undefined if there are no doctor players', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          mafias: [{ id: otherPlayers[0].id, status: 'Active' }],
        });
        expect(controller.doctor).toBe(undefined);
      });
    });
    /*
    describe('playersAlive', () => {
      it('should return all players as alive by default', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          villagers: [
            { id: otherPlayers[0].id, status: 'Active' },
            { id: otherPlayers[1].id, status: 'Active' },
          ],
          mafias: [
            { id: otherPlayers[2].id, status: 'Active' },
            { id: otherPlayers[3].id, status: 'Active' },
          ],
          doctor: { id: otherPlayers[4].id, status: 'Active' },
          police: { id: ourPlayer.id, status: 'Active' },
        });
        expect(controller.playersAlive).toEqual([
          otherPlayers[0].id,
          otherPlayers[1].id,
          otherPlayers[2].id,
          otherPlayers[3].id,
          otherPlayers[4].id,
          ourPlayer.id,
        ]);
      });
      it('should return the correct players as alive when some are deceased', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          villagers: [
            { id: otherPlayers[0].id, status: 'Active' },
            { id: otherPlayers[1].id, status: 'Active' },
          ],
          mafias: [
            { id: otherPlayers[2].id, status: 'Spectator' },
            { id: otherPlayers[3].id, status: 'Active' },
          ],
          doctor: { id: otherPlayers[4].id, status: 'Spectator' },
          police: { id: ourPlayer.id, status: 'Active' },
        });
        expect(controller.playersAlive).toEqual([
          otherPlayers[0].id,
          otherPlayers[1].id,
          otherPlayers[3].id,
          ourPlayer.id,
        ]);
      });
    });
    */
    describe('winnerTeam', () => {
      it('should return the winning team and the winner of such team', () => {
        const controller = mafiaGameControllerWithProp({
          status: 'OVER',
          winnerTeam: 'CIVILIANS_TEAM',
        });
        expect(controller.winnerTeam).toBe('CIVILIANS_TEAM');
      });
    });
    describe('makeMove', () => {
      it('should throw an error if the game is not in progress', async () => {
        const controller = mafiaGameControllerWithProp({});
        await expect(async () => controller.makeMove(otherPlayers[0].id)).rejects.toEqual(
          new Error(NO_GAME_IN_PROGRESS_ERROR),
        );
      });
      it('should call townController.sendInteractableCommand with the correct vote move', async () => {
        const controller = mafiaGameControllerWithProp({
          status: 'IN_PROGRESS',
          villagers: [
            { id: ourPlayer.id, status: 'Active' },
            { id: otherPlayers[0].id, status: 'Spectator' },
          ],
          mafias: [
            { id: otherPlayers[1].id, status: 'Spectator' },
            { id: otherPlayers[2].id, status: 'Spectator' },
          ],
        });
        const instanceID = nanoid();
        mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
          return { gameID: instanceID };
        });
        await controller.joinGame();
        mockTownController.sendInteractableCommand.mockReset();
        await controller.makeMove(otherPlayers[0].id);
        expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
          type: 'GameMove',
          gameID: instanceID,
          move: {
            playerVoting: ourPlayer.id,
            playerVoted: otherPlayers[0].id,
          },
        });
      });
    });
  });
});
