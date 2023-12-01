import InteractableArea from './InteractableArea';
export default class ViewingArea extends InteractableArea {
    _video;
    _isPlaying;
    _elapsedTimeSec;
    get video() {
        return this._video;
    }
    get elapsedTimeSec() {
        return this._elapsedTimeSec;
    }
    get isPlaying() {
        return this._isPlaying;
    }
    constructor({ id, isPlaying, elapsedTimeSec: progress, video }, coordinates, townEmitter) {
        super(id, coordinates, townEmitter);
        this._video = video;
        this._elapsedTimeSec = progress;
        this._isPlaying = isPlaying;
    }
    remove(player) {
        super.remove(player);
        if (this._occupants.length === 0) {
            this._video = undefined;
            this._emitAreaChanged();
        }
    }
    updateModel({ isPlaying, elapsedTimeSec: progress, video }) {
        this._video = video;
        this._isPlaying = isPlaying;
        this._elapsedTimeSec = progress;
    }
    toModel() {
        return {
            id: this.id,
            video: this._video,
            isPlaying: this._isPlaying,
            elapsedTimeSec: this._elapsedTimeSec,
            occupants: this.occupantsByID,
            type: 'ViewingArea',
        };
    }
    static fromMapObject(mapObject, townEmitter) {
        const { name, width, height } = mapObject;
        if (!width || !height) {
            throw new Error(`Malformed viewing area ${name}`);
        }
        const rect = { x: mapObject.x, y: mapObject.y, width, height };
        return new ViewingArea({
            isPlaying: false,
            id: name,
            elapsedTimeSec: 0,
            occupants: [],
            type: 'ViewingArea',
        }, rect, townEmitter);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlld2luZ0FyZWEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdG93bi9WaWV3aW5nQXJlYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFPQSxPQUFPLGdCQUFnQixNQUFNLG9CQUFvQixDQUFDO0FBRWxELE1BQU0sQ0FBQyxPQUFPLE9BQU8sV0FBWSxTQUFRLGdCQUFnQjtJQUMvQyxNQUFNLENBQVU7SUFFaEIsVUFBVSxDQUFVO0lBRXBCLGVBQWUsQ0FBUztJQUVoQyxJQUFXLEtBQUs7UUFDZCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDckIsQ0FBQztJQUVELElBQVcsY0FBYztRQUN2QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7SUFDOUIsQ0FBQztJQUVELElBQVcsU0FBUztRQUNsQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDekIsQ0FBQztJQVNELFlBQ0UsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFvQixFQUNwRSxXQUF3QixFQUN4QixXQUF3QjtRQUV4QixLQUFLLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLENBQUMsZUFBZSxHQUFHLFFBQVEsQ0FBQztRQUNoQyxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztJQUM5QixDQUFDO0lBVU0sTUFBTSxDQUFDLE1BQWM7UUFDMUIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNoQyxJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztZQUN4QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUN6QjtJQUNILENBQUM7SUFPTSxXQUFXLENBQUMsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQW9CO1FBQ2pGLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQzVCLElBQUksQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDO0lBQ2xDLENBQUM7SUFNTSxPQUFPO1FBQ1osT0FBTztZQUNMLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtZQUNYLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNsQixTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVU7WUFDMUIsY0FBYyxFQUFFLElBQUksQ0FBQyxlQUFlO1lBQ3BDLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYTtZQUM3QixJQUFJLEVBQUUsYUFBYTtTQUNwQixDQUFDO0lBQ0osQ0FBQztJQVFNLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBMEIsRUFBRSxXQUF3QjtRQUM5RSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUM7UUFDMUMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNyQixNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQ25EO1FBQ0QsTUFBTSxJQUFJLEdBQWdCLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQzVFLE9BQU8sSUFBSSxXQUFXLENBQ3BCO1lBQ0UsU0FBUyxFQUFFLEtBQUs7WUFDaEIsRUFBRSxFQUFFLElBQUk7WUFDUixjQUFjLEVBQUUsQ0FBQztZQUNqQixTQUFTLEVBQUUsRUFBRTtZQUNiLElBQUksRUFBRSxhQUFhO1NBQ3BCLEVBQ0QsSUFBSSxFQUNKLFdBQVcsQ0FDWixDQUFDO0lBQ0osQ0FBQztDQUNGIn0=