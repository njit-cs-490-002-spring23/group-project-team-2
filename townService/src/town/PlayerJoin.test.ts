import { createPlayerForTesting, isIdInArray } from '../TestUtils';
import Player from '../lib/Player';
import MafiaGame from './games/MafiaGame';
import {
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  GAME_FULL_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../lib/InvalidParametersError';
import { PlayerState } from '../types/CoveyTownSocket';

jest.setTimeout(30000); // Sets timeout to 30 seconds

function roleIDs(roles: PlayerState[]): string[] {
  const ids: string[] = [];
  for (let i = 0; i < roles.length; i++) {
    ids.push(roles[i].id);
  }
  return ids;
}

function validRole(roles: string[], players: Player[]): number {
  let roleCount = 0;
  for (let i = 0; i < players.length; i++) {
    if (isIdInArray(roles, players[i].id)) {
      roleCount += 1;
    }
  }
  return roleCount;
}

const playerJoining = (numberOfPlayersNeeded: number, game: MafiaGame) => {
  const players = [];
  for (let playerNumber = 0; playerNumber < numberOfPlayersNeeded; playerNumber++) {
    const player = createPlayerForTesting();
    game.join(player);
    players.push(player);
  }
  return players;
};

describe('Mafia Game', () => {
  let game: MafiaGame;
  beforeEach(() => {
    game = new MafiaGame();
  });
  describe('Joining', () => {
    beforeEach(() => {
      game = new MafiaGame();
    });
    describe('6 players', () => {
      let players: Player[];
      beforeEach(() => {
        players = playerJoining(6, game);
        game.startGame();
      });
      it('only 2 villagers are present', () => {
        const villagers = roleIDs(game.state.villagers as PlayerState[]);
        expect(validRole(villagers, players)).toEqual(2);
      });
      it('only 2 mafia are present', () => {
        const mafia = roleIDs(game.state.mafia as PlayerState[]);
        expect(validRole(mafia, players)).toEqual(2);
      });
      it('only 1 doctor', () => {
        const doctor = roleIDs([game.state.doctor] as PlayerState[]);
        expect(validRole(doctor, players)).toEqual(1);
      });
      it('only 1 police officer', () => {
        const police = roleIDs([game.state.police] as PlayerState[]);
        expect(validRole(police, players)).toEqual(1);
      });
    });
    describe('7 players', () => {
      let players: Player[];
      beforeEach(() => {
        players = playerJoining(7, game);
        game.startGame();
      });
      it('only 3 villagers are present', () => {
        const villagers = roleIDs(game.state.villagers as PlayerState[]);
        expect(validRole(villagers, players)).toEqual(3);
      });
      it('only 2 mafia are present', () => {
        const mafia = roleIDs(game.state.mafia as PlayerState[]);
        expect(validRole(mafia, players)).toEqual(2);
      });
      it('only 1 doctor', () => {
        const doctor = roleIDs([game.state.doctor] as PlayerState[]);
        expect(validRole(doctor, players)).toEqual(1);
      });
      it('only 1 police officer', () => {
        const police = roleIDs([game.state.police] as PlayerState[]);
        expect(validRole(police, players)).toEqual(1);
      });
    });
    describe('8 players', () => {
      let players: Player[];
      beforeEach(() => {
        players = playerJoining(8, game);
        game.startGame();
      });
      it('only 3 villagers are present', () => {
        const villagers = roleIDs(game.state.villagers as PlayerState[]);
        expect(validRole(villagers, players)).toEqual(3);
      });
      it('only 3 mafia are present', () => {
        const mafia = roleIDs(game.state.mafia as PlayerState[]);
        expect(validRole(mafia, players)).toEqual(3);
      });
      it('only 1 doctor', () => {
        const doctor = roleIDs([game.state.doctor] as PlayerState[]);
        expect(validRole(doctor, players)).toEqual(1);
      });
      it('only 1 police officer', () => {
        const police = roleIDs([game.state.police] as PlayerState[]);
        expect(validRole(police, players)).toEqual(1);
      });
    });
    describe('9 players', () => {
      let players: Player[];
      beforeEach(() => {
        players = playerJoining(9, game);
        game.startGame();
      });
      it('only 4 villagers are present', () => {
        const villagers = roleIDs(game.state.villagers as PlayerState[]);
        expect(validRole(villagers, players)).toEqual(4);
      });
      it('only 3 mafia are present', () => {
        const mafia = roleIDs(game.state.mafia as PlayerState[]);
        expect(validRole(mafia, players)).toEqual(3);
      });
      it('only 1 doctor', () => {
        const doctor = roleIDs([game.state.doctor] as PlayerState[]);
        expect(validRole(doctor, players)).toEqual(1);
      });
      it('only 1 police officer', () => {
        const police = roleIDs([game.state.police] as PlayerState[]);
        expect(validRole(police, players)).toEqual(1);
      });
    });
    describe('10 players', () => {
      let players: Player[];
      beforeEach(() => {
        players = playerJoining(10, game);
        game.startGame();
      });
      it('only 5 villagers are present', () => {
        const villagers = roleIDs(game.state.villagers as PlayerState[]);
        expect(validRole(villagers, players)).toEqual(5);
      });
      it('only 3 mafia are present', () => {
        const mafia = roleIDs(game.state.mafia as PlayerState[]);
        expect(validRole(mafia, players)).toEqual(3);
      });
      it('only 1 doctor', () => {
        const doctor = roleIDs([game.state.doctor] as PlayerState[]);
        expect(validRole(doctor, players)).toEqual(1);
      });
      it('only 1 police officer', () => {
        const police = roleIDs([game.state.police] as PlayerState[]);
        expect(validRole(police, players)).toEqual(1);
      });
    });
    it('should throw an error if the players is already in the game', () => {
      expect(game.state.status).toBe('WAITING_TO_START');
      const player1 = createPlayerForTesting();
      game.join(player1);
      expect(() => game.join(player1)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });
    it('should throw an error if the game is full', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const player3 = createPlayerForTesting();
      const player4 = createPlayerForTesting();
      const player5 = createPlayerForTesting();
      const player6 = createPlayerForTesting();
      const player7 = createPlayerForTesting();
      const player8 = createPlayerForTesting();
      const player9 = createPlayerForTesting();
      const player10 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);
      game.join(player3);
      game.join(player4);
      game.join(player5);
      game.join(player6);
      game.join(player7);
      game.join(player8);
      game.join(player9);
      game.join(player10);
      game.startGame();
      const player11 = createPlayerForTesting();
      expect(game.state.status).toBe('IN_PROGRESS');
      expect(() => game.join(player11)).toThrowError(GAME_FULL_MESSAGE);
    });
  });
  describe('Leaving', () => {
    it('should throw an error if the player is not in the game', () => {
      const player = createPlayerForTesting();
      expect(() => game.leave(player)).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
    });
    it('when the game is not in progress, the game status should be set to WAITING_TO_START and remove the player if there is less than 6 players', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const player3 = createPlayerForTesting();
      const player4 = createPlayerForTesting();
      const player5 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);
      game.join(player3);
      game.join(player4);
      game.join(player5);
      game.leave(player5);
      expect(game.state.status).toBe('WAITING_TO_START');
    });
    describe('when players are in the game', () => {
      let players: Player[];
      beforeEach(() => {
        players = [
          createPlayerForTesting(),
          createPlayerForTesting(),
          createPlayerForTesting(),
          createPlayerForTesting(),
          createPlayerForTesting(),
          createPlayerForTesting(),
        ];
        for (let i = 0; i < players.length; i++) game.join(players[i]);
        game.startGame();
      });
      it('if all mafia memebers leave the game while the game is in progress the villagers should win', () => {
        expect(game.state.status).toBe('IN_PROGRESS');
        const mafia = roleIDs(game.state.mafia as PlayerState[]);
        for (let i = 0; i < players.length; i++)
          if (isIdInArray(mafia, players[i].id)) game.leave(players[i]);
        expect(game.state.status).toBe('OVER');
        expect(game.state.winnerTeam).toBe('CIVILIANS_TEAM');
      });
    });
  });
});
