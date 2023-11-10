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
    });
  });
});
