import { createPlayerForTesting, isIdInArray } from '../TestUtils';
import Player from '../lib/Player';
import MafiaGame from '../games/MafiaGame';
import {
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  GAME_FULL_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../lib/InvalidParametersError';

const validRole = (role: string[], players: Player[]) => {
  let roleCount = 0;
  for (let i = 0; i < players.length; i++) {
    if (isIdInArray(role, players[i].id)) {
      roleCount += 1;
    }
  }
  return roleCount;
};

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
    describe('6 players', () => {
      let players: Player[];
      beforeEach(() => {
        players = playerJoining(6, game);
      });
      it('only 2 villagers are present', () => {
        const { villagers } = game.state.villagers;
        expect(validRole(villagers, players)).toEqual(2);
      });
      it('only 2 mafia are present', () => {
        const { mafia } = game.state.mafia;
        expect(validRole(mafia, players)).toEqual(2);
      });
      it('only 1 doctor', () => {
        const { doctor } = game.state.doctor;
        let checkDoctor = 0;
        for (let i = 0; i < players.length; i++) {
          if (doctor.id === players[i].id) {
            checkDoctor++;
          }
        }
        expect(checkDoctor).toBe(1);
      });
      it('only 1 police officer', () => {
        const { police } = game.state.police;
        let checkPolice = 0;
        for (let i = 0; i < players.length; i++) {
          if (police.id === players[i].id) {
            checkPolice++;
          }
        }
        expect(checkPolice).toBe(1);
      });
    });
    describe('7 players', () => {
      let players: Player[];
      beforeEach(() => {
        players = playerJoining(7, game);
      });
      it('only 3 villagers are present', () => {
        const { villagers } = game.state.villagers;
        expect(validRole(villagers, players)).toEqual(3);
      });
      it('only 2 mafia are present', () => {
        const { mafia } = game.state.mafia;
        expect(validRole(mafia, players)).toEqual(2);
      });
      it('only 1 doctor', () => {
        const { doctor } = game.state.doctor;
        let checkDoctor = 0;
        for (let i = 0; i < players.length; i++) {
          if (doctor.id === players[i].id) {
            checkDoctor++;
          }
        }
        expect(checkDoctor).toBe(1);
      });
      it('only 1 police officer', () => {
        const { police } = game.state.police;
        let checkPolice = 0;
        for (let i = 0; i < players.length; i++) {
          if (police.id === players[i].id) {
            checkPolice++;
          }
        }
        expect(checkPolice).toBe(1);
      });
    });
    describe('8 players', () => {
      let players: Player[];
      beforeEach(() => {
        players = playerJoining(8, game);
      });
      it('only 3 villagers are present', () => {
        const { villagers } = game.state.villagers;
        expect(validRole(villagers, players)).toEqual(3);
      });
      it('only 3 mafia are present', () => {
        const { mafia } = game.state.mafia;
        expect(validRole(mafia, players)).toEqual(3);
      });
      it('only 1 doctor', () => {
        const { doctor } = game.state.doctor;
        let checkDoctor = 0;
        for (let i = 0; i < players.length; i++) {
          if (doctor.id === players[i].id) {
            checkDoctor++;
          }
        }
        expect(checkDoctor).toBe(1);
      });
      it('only 1 police officer', () => {
        const { police } = game.state.police;
        let checkPolice = 0;
        for (let i = 0; i < players.length; i++) {
          if (police.id === players[i].id) {
            checkPolice++;
          }
        }
        expect(checkPolice).toBe(1);
      });
    });
    describe('9 players', () => {
      let players: Player[];
      beforeEach(() => {
        players = playerJoining(9, game);
      });
      it('only 4 villagers are present', () => {
        const { villagers } = game.state.villagers;
        expect(validRole(villagers, players)).toEqual(4);
      });
      it('only 3 mafia are present', () => {
        const { mafia } = game.state.mafia;
        expect(validRole(mafia, players)).toEqual(3);
      });
      it('only 1 doctor', () => {
        const { doctor } = game.state.doctor;
        let checkDoctor = 0;
        for (let i = 0; i < players.length; i++) {
          if (doctor.id === players[i].id) {
            checkDoctor++;
          }
        }
        expect(checkDoctor).toBe(1);
      });
      it('only 1 police officer', () => {
        const { police } = game.state.police;
        let checkPolice = 0;
        for (let i = 0; i < players.length; i++) {
          if (police.id === players[i].id) {
            checkPolice++;
          }
        }
        expect(checkPolice).toBe(1);
      });
    });
    describe('10 players', () => {
      let players: Player[];
      beforeEach(() => {
        players = playerJoining(10, game);
      });
      it('only 5 villagers are present', () => {
        const { villagers } = game.state.villagers;
        expect(validRole(villagers, players)).toEqual(5);
      });
      it('only 3 mafia are present', () => {
        const { mafia } = game.state.mafia;
        expect(validRole(mafia, players)).toEqual(3);
      });
      it('only 1 doctor', () => {
        const { doctor } = game.state.doctor;
        let checkDoctor = 0;
        for (let i = 0; i < players.length; i++) {
          if (doctor.id === players[i].id) {
            checkDoctor++;
          }
        }
        expect(checkDoctor).toBe(1);
      });
      it('only 1 police officer', () => {
        const { police } = game.state.police;
        let checkPolice = 0;
        for (let i = 0; i < players.length; i++) {
          if (police.id === players[i].id) {
            checkPolice++;
          }
        }
        expect(checkPolice).toBe(1);
      });
    });
    it('should throw an error if the players is already in the game', () => {
      expect(game.state).toBe('WAITING_TO_START');
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
      const player11 = createPlayerForTesting();
      expect(game.state).toBe('IN_PROGRESS');
      expect(() => game.join(player11)).toThrowError(GAME_FULL_MESSAGE);
    });
  });
  describe('Leaving', () => {
    it('should throw an error if the player is not in the game', () => {
      const player = createPlayerForTesting();
      game.join(player);
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
      beforeEach(() => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        const player3 = createPlayerForTesting();
        const player4 = createPlayerForTesting();
        const player5 = createPlayerForTesting();
        const player6 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        game.join(player3);
        game.join(player4);
        game.join(player5);
        game.join(player6);
      });
      it('if all mafia memebers leave the game while the game is in progress the villagers should win', () => {
        expect(game.state).toBe('IN_PROGRESS');
        const mafiaPlayer1 = game.state.mafia[0];
        const mafiaPlayer2 = game.state.mafia[1];
        game.leave(mafiaPlayer1);
        game.leave(mafiaPlayer2);
        expect(game.state).toBe('OVER');
        expect(game.state.status.winnerTeam).toBe('CIVILIANS_TEAM');
      });
    });
  });
});
