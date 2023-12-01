import InteractableArea from './InteractableArea';
export default class ConversationArea extends InteractableArea {
    topic;
    get isActive() {
        return this._occupants.length > 0;
    }
    constructor({ topic, id }, coordinates, townEmitter) {
        super(id, coordinates, townEmitter);
        this.topic = topic;
    }
    remove(player) {
        super.remove(player);
        if (this._occupants.length === 0) {
            this.topic = undefined;
            this._emitAreaChanged();
        }
    }
    toModel() {
        return {
            id: this.id,
            occupants: this.occupantsByID,
            topic: this.topic,
            type: 'ConversationArea',
        };
    }
    static fromMapObject(mapObject, broadcastEmitter) {
        const { name, width, height } = mapObject;
        if (!width || !height) {
            throw new Error(`Malformed viewing area ${name}`);
        }
        const rect = { x: mapObject.x, y: mapObject.y, width, height };
        return new ConversationArea({
            id: name,
            occupants: [],
            type: 'ConversationArea',
        }, rect, broadcastEmitter);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udmVyc2F0aW9uQXJlYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90b3duL0NvbnZlcnNhdGlvbkFyZWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBT0EsT0FBTyxnQkFBZ0IsTUFBTSxvQkFBb0IsQ0FBQztBQUVsRCxNQUFNLENBQUMsT0FBTyxPQUFPLGdCQUFpQixTQUFRLGdCQUFnQjtJQUVyRCxLQUFLLENBQVU7SUFHdEIsSUFBVyxRQUFRO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFTRCxZQUNFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBeUIsRUFDcEMsV0FBd0IsRUFDeEIsV0FBd0I7UUFFeEIsS0FBSyxDQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsQ0FBQztJQVVNLE1BQU0sQ0FBQyxNQUFjO1FBQzFCLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckIsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDaEMsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7WUFDdkIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7U0FDekI7SUFDSCxDQUFDO0lBTU0sT0FBTztRQUNaLE9BQU87WUFDTCxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDWCxTQUFTLEVBQUUsSUFBSSxDQUFDLGFBQWE7WUFDN0IsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2pCLElBQUksRUFBRSxrQkFBa0I7U0FDekIsQ0FBQztJQUNKLENBQUM7SUFRTSxNQUFNLENBQUMsYUFBYSxDQUN6QixTQUEwQixFQUMxQixnQkFBNkI7UUFFN0IsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFDO1FBQzFDLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUNuRDtRQUNELE1BQU0sSUFBSSxHQUFnQixFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztRQUM1RSxPQUFPLElBQUksZ0JBQWdCLENBQ3pCO1lBQ0UsRUFBRSxFQUFFLElBQUk7WUFDUixTQUFTLEVBQUUsRUFBRTtZQUNiLElBQUksRUFBRSxrQkFBa0I7U0FDekIsRUFDRCxJQUFJLEVBQ0osZ0JBQWdCLENBQ2pCLENBQUM7SUFDSixDQUFDO0NBQ0YifQ==