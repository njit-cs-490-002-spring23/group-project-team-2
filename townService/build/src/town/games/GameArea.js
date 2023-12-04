import InteractableArea from '../InteractableArea';
export default class GameArea extends InteractableArea {
    _game;
    _history = [];
    _isActive = true;
    get game() {
        return this._game;
    }
    get history() {
        return this._history;
    }
    toModel() {
        return {
            id: this.id,
            game: this._game?.toModel(),
            history: this._history,
            occupants: this.occupantsByID,
            type: this.getType(),
        };
    }
    get isActive() {
        return this._isActive;
    }
    remove(player) {
        if (this._game) {
            this._game.leave(player);
        }
        super.remove(player);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZUFyZWEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdG93bi9nYW1lcy9HYW1lQXJlYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFPQSxPQUFPLGdCQUFnQixNQUFNLHFCQUFxQixDQUFDO0FBT25ELE1BQU0sQ0FBQyxPQUFPLE9BQWdCLFFBRTVCLFNBQVEsZ0JBQWdCO0lBQ2QsS0FBSyxDQUFZO0lBRWpCLFFBQVEsR0FBaUIsRUFBRSxDQUFDO0lBRTVCLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFFM0IsSUFBVyxJQUFJO1FBQ2IsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3BCLENBQUM7SUFFRCxJQUFXLE9BQU87UUFDaEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3ZCLENBQUM7SUFFTSxPQUFPO1FBQ1osT0FBTztZQUNMLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtZQUNYLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRTtZQUMzQixPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdEIsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQzdCLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFO1NBQ3JCLENBQUM7SUFDSixDQUFDO0lBRUQsSUFBVyxRQUFRO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO0lBSU0sTUFBTSxDQUFDLE1BQWM7UUFDMUIsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDMUI7UUFDRCxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7Q0FDRiJ9