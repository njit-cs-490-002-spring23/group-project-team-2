import { createPlayerForTesting, isIdInArray } from '../TestUtils';
import Player from '../lib/Player';

const validRole = (role: string[], players: Player[]) => {
  let roleCount = 0;
  for (let i = 0; i < players.length; i++) {
    if (isIdInArray(role, players[i].id)) {
      roleCount += 1;
    }
  }
  return roleCount;
};

describe('Mafia', () => {
  let game: MafiaGame;
  beforeEach(() => {
    game = new MafiaGame();
  });
  describe('Joining', () => {
    let player1: Player;
    let player2: Player;
    let player3: Player;
    let player4: Player;
    let player5: Player;
    let player6: Player;
    let player7: Player;
    let player8: Player;
    let player9: Player;
    let player10: Player;
    describe('6 players', () => {
      beforeEach(() => {
        player1 = createPlayerForTesting();
        player2 = createPlayerForTesting();
        player3 = createPlayerForTesting();
        player4 = createPlayerForTesting();
        player5 = createPlayerForTesting();
        player6 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        game.join(player3);
        game.join(player4);
        game.join(player5);
        game.join(player6);
      });
      it('only 2 villagers are present', () => {
        const { villagers } = game.state.villagers;
        const players = [player1, player2, player3, player4, player5, player6];
        expect(validRole(villagers, players)).toEqual(2);
      });
      it('only 2 mafia are present', () => {
        const { mafia } = game.state.mafia;
        const players = [player1, player2, player3, player4, player5, player6];
        expect(validRole(mafia, players)).toEqual(2);
      });
      it('only 1 doctor', () => {
        const { doctor } = game.state.doctor;
        const players = [player1, player2, player3, player4, player5, player6];
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
        const players = [player1, player2, player3, player4, player5, player6];
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
      beforeEach(() => {
        player1 = createPlayerForTesting();
        player2 = createPlayerForTesting();
        player3 = createPlayerForTesting();
        player4 = createPlayerForTesting();
        player5 = createPlayerForTesting();
        player6 = createPlayerForTesting();
        player7 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        game.join(player3);
        game.join(player4);
        game.join(player5);
        game.join(player6);
        game.join(player7);
      });
      it('only 3 villagers are present', () => {
        const { villagers } = game.state.villagers;
        const players = [player1, player2, player3, player4, player5, player6];
        expect(validRole(villagers, players)).toEqual(3);
      });
      it('only 2 mafia are present', () => {
        const { mafia } = game.state.mafia;
        const players = [player1, player2, player3, player4, player5, player6];
        expect(validRole(mafia, players)).toEqual(2);
      });
      it('only 1 doctor', () => {
        const { doctor } = game.state.doctor;
        const players = [player1, player2, player3, player4, player5, player6];
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
        const players = [player1, player2, player3, player4, player5, player6];
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
      beforeEach(() => {
        player1 = createPlayerForTesting();
        player2 = createPlayerForTesting();
        player3 = createPlayerForTesting();
        player4 = createPlayerForTesting();
        player5 = createPlayerForTesting();
        player6 = createPlayerForTesting();
        player7 = createPlayerForTesting();
        player8 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        game.join(player3);
        game.join(player4);
        game.join(player5);
        game.join(player6);
        game.join(player7);
        game.join(player8);
      });
      it('only 3 villagers are present', () => {
        const { villagers } = game.state.villagers;
        const players = [player1, player2, player3, player4, player5, player6];
        expect(validRole(villagers, players)).toEqual(3);
      });
      it('only 3 mafia are present', () => {
        const { mafia } = game.state.mafia;
        const players = [player1, player2, player3, player4, player5, player6];
        expect(validRole(mafia, players)).toEqual(3);
      });
      it('only 1 doctor', () => {
        const { doctor } = game.state.doctor;
        const players = [player1, player2, player3, player4, player5, player6];
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
        const players = [player1, player2, player3, player4, player5, player6];
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
      beforeEach(() => {
        player1 = createPlayerForTesting();
        player2 = createPlayerForTesting();
        player3 = createPlayerForTesting();
        player4 = createPlayerForTesting();
        player5 = createPlayerForTesting();
        player6 = createPlayerForTesting();
        player7 = createPlayerForTesting();
        player8 = createPlayerForTesting();
        player9 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        game.join(player3);
        game.join(player4);
        game.join(player5);
        game.join(player6);
        game.join(player7);
        game.join(player8);
        game.join(player9);
      });
      it('only 4 villagers are present', () => {
        const { villagers } = game.state.villagers;
        const players = [player1, player2, player3, player4, player5, player6];
        expect(validRole(villagers, players)).toEqual(4);
      });
      it('only 3 mafia are present', () => {
        const { mafia } = game.state.mafia;
        const players = [player1, player2, player3, player4, player5, player6];
        expect(validRole(mafia, players)).toEqual(3);
      });
      it('only 1 doctor', () => {
        const { doctor } = game.state.doctor;
        const players = [player1, player2, player3, player4, player5, player6];
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
        const players = [player1, player2, player3, player4, player5, player6];
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
      beforeEach(() => {
        player1 = createPlayerForTesting();
        player2 = createPlayerForTesting();
        player3 = createPlayerForTesting();
        player4 = createPlayerForTesting();
        player5 = createPlayerForTesting();
        player6 = createPlayerForTesting();
        player7 = createPlayerForTesting();
        player8 = createPlayerForTesting();
        player9 = createPlayerForTesting();
        player10 = createPlayerForTesting();
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
      });
      it('only 5 villagers are present', () => {
        const { villagers } = game.state.villagers;
        const players = [player1, player2, player3, player4, player5, player6];
        expect(validRole(villagers, players)).toEqual(5);
      });
      it('only 3 mafia are present', () => {
        const { mafia } = game.state.mafia;
        const players = [player1, player2, player3, player4, player5, player6];
        expect(validRole(mafia, players)).toEqual(3);
      });
      it('only 1 doctor', () => {
        const { doctor } = game.state.doctor;
        const players = [player1, player2, player3, player4, player5, player6];
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
        const players = [player1, player2, player3, player4, player5, player6];
        let checkPolice = 0;
        for (let i = 0; i < players.length; i++) {
          if (police.id === players[i].id) {
            checkPolice++;
          }
        }
        expect(checkPolice).toBe(1);
      });
    });
  });
});
