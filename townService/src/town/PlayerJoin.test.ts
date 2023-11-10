import { createPlayerForTesting, isIdInArray } from '../TestUtils';

describe('Mafia', () => {
  let game: MafiaGame;
  beforeEach(() => {
    game = new MafiaGame;
  });
  describe('Joining', () => {
    describe('There are 6 players', () => {
      it('you can start the game since you have the correct number of players in each role', () => {
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
        expect(game.state.police).toHaveLength(1);
        expect(game.state.doctor).toHaveLength(1);
        expect(game.state.villagers).toHaveLength(2);
        expect(game.state.mafia).toHaveLength(2);
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
      });
    });
    describe('There are 7 players', () => {
      it('you can start the game since you have the correct number of players in each role', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        const player3 = createPlayerForTesting();
        const player4 = createPlayerForTesting();
        const player5 = createPlayerForTesting();
        const player6 = createPlayerForTesting();
        const player7 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        game.join(player3);
        game.join(player4);
        game.join(player5);
        game.join(player6);
        game.join(player7);
        expect(game.state.police).toHaveLength(1);
        expect(game.state.doctor).toHaveLength(1);
        expect(game.state.villagers).toEqual(3);
        expect(game.state.mafia).toHaveLength(2);
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
      });
    });
    describe('There are 8 players', () => {
      it('you can start the game since you have the correct number of players in each role', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        const player3 = createPlayerForTesting();
        const player4 = createPlayerForTesting();
        const player5 = createPlayerForTesting();
        const player6 = createPlayerForTesting();
        const player7 = createPlayerForTesting();
        const player8 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        game.join(player3);
        game.join(player4);
        game.join(player5);
        game.join(player6);
        game.join(player7);
        game.join(player8);
        expect(game.state.police).toHaveLength(1);
        expect(game.state.doctor).toHaveLength(1);
        expect(game.state.villagers).toEqual(3);
        expect(game.state.mafia).toHaveLength(3);
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
      });
    });
    describe('There are 9 players', () => {
      it('you can start the game since you have the correct number of players in each role', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        const player3 = createPlayerForTesting();
        const player4 = createPlayerForTesting();
        const player5 = createPlayerForTesting();
        const player6 = createPlayerForTesting();
        const player7 = createPlayerForTesting();
        const player8 = createPlayerForTesting();
        const player9 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        game.join(player3);
        game.join(player4);
        game.join(player5);
        game.join(player6);
        game.join(player7);
        game.join(player8);
        game.join(player9);
        expect(game.state.police).toHaveLength(1);
        expect(game.state.doctor).toHaveLength(1);
        expect(game.state.villagers).toEqual(4);
        expect(game.state.mafia).toHaveLength(3);
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
      });
    });
    describe('There are 10 players', () => {
      it('you can start the game since you have the correct number of players in each role', () => {
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
        expect(game.state.police).toHaveLength(1);
        expect(game.state.doctor).toHaveLength(1);
        expect(game.state.villagers).toEqual(5);
        expect(game.state.mafia).toHaveLength(3);
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
      });
    });
  });
});
