import Game from './Game';
import InvalidParametersError, { GAME_FULL_MESSAGE, GAME_NOT_IN_PROGRESS_MESSAGE, PLAYER_ALREADY_IN_GAME_MESSAGE, PLAYER_NOT_IN_GAME_MESSAGE, } from '../../lib/InvalidParametersError';
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}
export default class MafiaGame extends Game {
    constructor() {
        super({
            moves: [],
            status: 'WAITING_TO_START',
        });
    }
    _randomlyAssignRoleTo(player) {
        let diceRoll;
        let roleAssigned = false;
        let minDiceNumber = 1;
        let maxDiceNumber = 4;
        if (this._players.length < 6) {
            while (!roleAssigned) {
                diceRoll = getRandomIntInclusive(minDiceNumber, maxDiceNumber);
                if (diceRoll === 1 && !this.state.police) {
                    this.state.police = {
                        id: player.id,
                        status: 'Active',
                    };
                    roleAssigned = true;
                }
                if (diceRoll === 2 && !this.state.doctor) {
                    this.state.doctor = {
                        id: player.id,
                        status: 'Active',
                    };
                    roleAssigned = true;
                }
                if (diceRoll === 3 && this.state.villagers) {
                    if (!this.state.villagers[0]) {
                        this.state.villagers[0] = {
                            id: player.id,
                            status: 'Active',
                        };
                        roleAssigned = true;
                    }
                    if (!this.state.villagers[1]) {
                        this.state.villagers[1] = {
                            id: player.id,
                            status: 'Active',
                        };
                        roleAssigned = true;
                    }
                }
                if (diceRoll === 4 && this.state.mafias) {
                    if (!this.state.mafias[0]) {
                        this.state.mafias[0] = {
                            id: player.id,
                            status: 'Active',
                        };
                        roleAssigned = true;
                    }
                    if (!this.state.mafias[1]) {
                        this.state.mafias[1] = {
                            id: player.id,
                            status: 'Active',
                        };
                        roleAssigned = true;
                    }
                }
            }
        }
        else {
            minDiceNumber = 1;
            maxDiceNumber = 2;
            while (!roleAssigned) {
                diceRoll = getRandomIntInclusive(minDiceNumber, maxDiceNumber);
                if (diceRoll === 1 && this.state.villagers) {
                    if (!this.state.villagers[2]) {
                        this.state.villagers[2] = {
                            id: player.id,
                            status: 'Active',
                        };
                        roleAssigned = true;
                    }
                    if (!this.state.villagers[3]) {
                        this.state.villagers[3] = {
                            id: player.id,
                            status: 'Active',
                        };
                        roleAssigned = true;
                    }
                }
                if (diceRoll === 2 && this.state.mafias) {
                    if (!this.state.mafias[2]) {
                        this.state.mafias[2] = {
                            id: player.id,
                            status: 'Active',
                        };
                        roleAssigned = true;
                    }
                }
            }
        }
    }
    _allMafiaIsDead() {
        let playerIndex;
        if (this.state.mafias) {
            for (playerIndex = 0; playerIndex < this.state.mafias?.length; playerIndex += 1) {
                if (this.state.mafias[playerIndex]?.status === 'Active') {
                    return false;
                }
            }
        }
        return true;
    }
    _getWinningTeam() {
        let playerIndex;
        const winningTeam = [];
        if (this._allMafiaIsDead() && this.state.doctor && this.state.police && this.state.villagers) {
            winningTeam.push(this.state.doctor?.id);
            winningTeam.push(this.state.police?.id);
            for (playerIndex = 0; playerIndex < this.state.villagers?.length; playerIndex += 1) {
                winningTeam.push(this.state.villagers[playerIndex].id);
            }
        }
        if (this.state.mafias) {
            for (playerIndex = 0; playerIndex < this.state.mafias.length; playerIndex += 1) {
                winningTeam.push(this.state.mafias[playerIndex].id);
            }
        }
        return winningTeam;
    }
    applyMove(move) {
        this._validateMove();
        this._applyMove(move.move);
    }
    _validateMove() {
        if (this.state.status !== 'IN_PROGRESS') {
            throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
        }
    }
    _applyMove(move) {
        this.state = {
            ...this.state,
            moves: [...this.state.moves, move],
        };
    }
    _join(player) {
        if (this._players.includes(player)) {
            throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
        }
        if (this._players.length === 0) {
            this._randomlyAssignRoleTo(player);
            this.state.status = 'WAITING_TO_START';
        }
        if (this._players.length < 6) {
            this._randomlyAssignRoleTo(player);
        }
        if (this._players.length === 10) {
            throw new InvalidParametersError(GAME_FULL_MESSAGE);
        }
    }
    _leave(player) {
        let currentGameStatus = this.state.status;
        const minNumberOfPlayers = 6;
        if (!this._players.includes(player)) {
            throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
        }
        if (this._players.length === minNumberOfPlayers && currentGameStatus === 'IN_PROGRESS') {
            currentGameStatus = 'OVER';
            this.state.winners = this._getWinningTeam();
        }
        if (this.state.status === 'OVER') {
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFmaWFHYW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Rvd24vZ2FtZXMvTWFmaWFHYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sSUFBSSxNQUFNLFFBQVEsQ0FBQztBQUcxQixPQUFPLHNCQUFzQixFQUFFLEVBQzdCLGlCQUFpQixFQUNqQiw0QkFBNEIsRUFDNUIsOEJBQThCLEVBQzlCLDBCQUEwQixHQUMzQixNQUFNLGtDQUFrQyxDQUFDO0FBTTFDLFNBQVMscUJBQXFCLENBQUMsR0FBVyxFQUFFLEdBQVc7SUFDckQsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckIsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDM0QsQ0FBQztBQUlELE1BQU0sQ0FBQyxPQUFPLE9BQU8sU0FBVSxTQUFRLElBQStCO0lBQ3BFO1FBQ0UsS0FBSyxDQUFDO1lBQ0osS0FBSyxFQUFFLEVBQUU7WUFDVCxNQUFNLEVBQUUsa0JBQWtCO1NBQzNCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFPTyxxQkFBcUIsQ0FBQyxNQUFjO1FBQzFDLElBQUksUUFBZ0IsQ0FBQztRQUNyQixJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDekIsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQztRQUN0QixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUM1QixPQUFPLENBQUMsWUFBWSxFQUFFO2dCQUNwQixRQUFRLEdBQUcscUJBQXFCLENBQUMsYUFBYSxFQUFF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