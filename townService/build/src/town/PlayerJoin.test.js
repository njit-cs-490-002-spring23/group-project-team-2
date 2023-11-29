import { createPlayerForTesting, isIdInArray } from '../TestUtils';
const validRole = (role, players) => {
    let roleCount = 0;
    for (let i = 0; i < players.length; i++) {
        if (isIdInArray(role, players[i].id)) {
            roleCount += 1;
        }
    }
    return roleCount;
};
describe('Mafia', () => {
    let game;
    beforeEach(() => {
        game = new MafiaGame();
    });
    describe('Joining', () => {
        let player1;
        let player2;
        let player3;
        let player4;
        let player5;
        let player6;
        let player7;
        let player8;
        let player9;
        let player10;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVySm9pbi50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Rvd24vUGxheWVySm9pbi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxXQUFXLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFHbkUsTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFjLEVBQUUsT0FBaUIsRUFBRSxFQUFFO0lBQ3RELElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztJQUNsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN2QyxJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ3BDLFNBQVMsSUFBSSxDQUFDLENBQUM7U0FDaEI7S0FDRjtJQUNELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUMsQ0FBQztBQUVGLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO0lBQ3JCLElBQUksSUFBZSxDQUFDO0lBQ3BCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDZCxJQUFJLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQztJQUN6QixDQUFDLENBQUMsQ0FBQztJQUNILFFBQVEsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFO1FBQ3ZCLElBQUksT0FBZSxDQUFDO1FBQ3BCLElBQUksT0FBZSxDQUFDO1FBQ3BCLElBQUksT0FBZSxDQUFDO1FBQ3BCLElBQUksT0FBZSxDQUFDO1FBQ3BCLElBQUksT0FBZSxDQUFDO1FBQ3BCLElBQUksT0FBZSxDQUFDO1FBQ3BCLElBQUksT0FBZSxDQUFDO1FBQ3BCLElBQUksT0FBZSxDQUFDO1FBQ3BCLElBQUksT0FBZSxDQUFDO1FBQ3BCLElBQUksUUFBZ0IsQ0FBQztRQUNyQixRQUFRLENBQUMsV0FBVyxFQUFF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