import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { defaultLocation, getLastEmittedEvent } from '../TestUtils';
import ConversationArea from './ConversationArea';
import InteractableArea, { PLAYER_SPRITE_HEIGHT, PLAYER_SPRITE_WIDTH } from './InteractableArea';
class TestInteractableArea extends InteractableArea {
    handleCommand() {
        throw new Error('Method not implemented.');
    }
    toModel() {
        return { id: this.id, occupants: [], type: 'ConversationArea' };
    }
}
const HALF_W = PLAYER_SPRITE_WIDTH / 2;
const HALF_H = PLAYER_SPRITE_HEIGHT / 2;
describe('InteractableArea', () => {
    const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
    let testArea;
    const id = nanoid();
    let newPlayer;
    const townEmitter = mock();
    beforeEach(() => {
        mockClear(townEmitter);
        testArea = new TestInteractableArea(id, testAreaBox, townEmitter);
        newPlayer = new Player(nanoid(), mock());
        testArea.add(newPlayer);
    });
    describe('add', () => {
        it('Adds the player to the occupants list', () => {
            expect(testArea.occupantsByID).toEqual([newPlayer.id]);
        });
        it("Sets the player's conversationLabel and emits an update for their location", () => {
            expect(newPlayer.location.interactableID).toEqual(id);
            const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
            expect(lastEmittedMovement.location.interactableID).toEqual(id);
        });
    });
    describe('remove', () => {
        it('Removes the player from the list of occupants', () => {
            testArea.remove(newPlayer);
            expect(testArea.occupantsByID).toEqual([]);
        });
        it("Clears the player's conversationLabel and emits an update for their location", () => {
            mockClear(townEmitter);
            testArea.remove(newPlayer);
            expect(newPlayer.location.interactableID).toBeUndefined();
            const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
            expect(lastEmittedMovement.location.interactableID).toBeUndefined();
        });
    });
    describe('isActive', () => {
        it('Returns true when there are players in the area', () => {
            expect(testArea.isActive).toBe(true);
        });
        it('Returns false when there are no players in the area', () => {
            testArea.remove(newPlayer);
            expect(testArea.isActive).toBe(false);
        });
    });
    describe('addPlayersWithinBounds', () => {
        let playersInArea;
        let playersNotInArea;
        beforeEach(() => {
            playersInArea = [];
            playersNotInArea = [];
            const box = testArea.boundingBox;
            for (let i = 0; i < 10; i++) {
                const player = new Player(nanoid(), mock());
                player.location.x = box.x + box.width / 2;
                player.location.y = box.y + box.height / 2;
                playersInArea.push(player);
            }
            for (let i = 0; i < 10; i++) {
                const player = new Player(nanoid(), mock());
                player.location.x = -100;
                player.location.y = -100;
                playersNotInArea.push(player);
            }
            const mixedPlayers = playersInArea
                .concat(playersNotInArea)
                .sort((a, b) => a.id.localeCompare(b.id));
            testArea.addPlayersWithinBounds(mixedPlayers);
        });
        it('Does not include players not within the area', () => {
            playersNotInArea.forEach(player => expect(testArea.occupantsByID.includes(player.id)).toBe(false));
        });
        it('Includes all players that are within the area', () => {
            playersInArea.forEach(player => expect(testArea.occupantsByID.includes(player.id)).toBe(true));
            expect(playersInArea.length).toEqual(playersInArea.length);
        });
    });
    describe('contains', () => {
        const { x, y, width, height } = testAreaBox;
        it.each([
            { x: x + width / 2, y: y + width / 2 },
            { x: x + 10 + width / 2, y: y + 10 + width / 2 },
            { x: x - 1 + width, y: y + 1 },
            { x: x + 1, y: y + 1 },
            { x: x - 1 + width, y: y - 1 + height },
            { x: x + 1, y: y - 1 + height },
        ])('Returns true for locations that are inside of the area %p', (location) => {
            expect(testArea.contains({ ...defaultLocation(), x: location.x, y: location.y })).toBe(true);
        });
        it.each([
            { x: x - 1 + HALF_W + width, y: y + 1 - HALF_H },
            { x: x + 1 - HALF_W, y: y + 1 - HALF_H },
            { x: x - 1 + HALF_W + width, y: y - 1 + HALF_H + height },
            { x: x + 1 - HALF_W, y: y - 1 + HALF_H + height },
        ])('Returns true for locations that are outside of the area, but are included due to the player sprite size overlapping with the target area', (location) => {
            expect(testArea.contains({ ...defaultLocation(), x: location.x, y: location.y })).toBe(true);
        });
        it.each([
            { x: x + HALF_W + width, y: y - HALF_H },
            { x: x - HALF_W, y: y - HALF_H },
            { x: x + HALF_W + width, y: y + HALF_H + height },
            { x: x - HALF_W, y: y + HALF_H + height },
        ])('Returns false for locations that exactly hit the edge of the area', (location) => {
            expect(testArea.contains({ ...defaultLocation(), x: location.x, y: location.y })).toBe(false);
        });
        it.each([
            { x: x + width * 2, y: y - height },
            { x: x - width, y: y - width },
            { x: x + width * 2, y: y + height * 2 },
            { x: x - width, y: y + height * 2 },
            { x: x + 1, y: y - height },
            { x: x - width, y: y + 1 },
            { x: x + width * 2, y: y + 1 },
            { x: x + 1, y: y + height * 2 },
        ])('Returns false for locations that are outside of the area', (location) => {
            expect(testArea.contains({ ...defaultLocation(), x: location.x, y: location.y })).toBe(false);
        });
    });
    describe('overlaps', () => {
        const cheight = testAreaBox.height / 2;
        const cwidth = testAreaBox.width / 2;
        const cx = testAreaBox.x + cwidth;
        const cy = testAreaBox.y + cheight;
        const { x, y, height, width } = testAreaBox;
        it.each([
            { x: cx, y: cy, width: 2, height: 2 },
            { x: cx + 4, y: cy + 4, width: 2, height: 2 },
            { x: cx + 4, y: cy + 4, width: 2, height: 2 },
        ])('Returns true for locations that are contained entirely %p', (intersectBox) => {
            expect(testArea.overlaps(new ConversationArea({ id: 'testArea', occupants: [], type: 'ConversationArea' }, intersectBox, mock()))).toBe(true);
        });
        it.each([
            { x: x - 50, y: y - 50, width: 100, height: 100 },
            { x: x - 50, y: y + height - 50, width: 100, height: 100 },
            { x: x + width - 50, y: y - 50, width: 100, height: 100 },
            { x: x + width - 50, y: y + height - 50, width: 100, height: 100 },
            {
                x: x - PLAYER_SPRITE_WIDTH / 2,
                y: y - PLAYER_SPRITE_HEIGHT / 2,
                width: PLAYER_SPRITE_WIDTH + 1,
                height: PLAYER_SPRITE_HEIGHT + 1,
            },
            {
                x: x - PLAYER_SPRITE_WIDTH / 2,
                y: y + height + PLAYER_SPRITE_HEIGHT / 2,
                width: PLAYER_SPRITE_WIDTH + 1,
                height: PLAYER_SPRITE_HEIGHT + 1,
            },
            {
                x: x + width + PLAYER_SPRITE_WIDTH / 2,
                y: y - PLAYER_SPRITE_HEIGHT / 2,
                width: PLAYER_SPRITE_WIDTH + 1,
                height: PLAYER_SPRITE_HEIGHT + 1,
            },
            {
                x: x + width + PLAYER_SPRITE_WIDTH / 2,
                y: y + height + PLAYER_SPRITE_HEIGHT / 2,
                width: PLAYER_SPRITE_WIDTH + 1,
                height: PLAYER_SPRITE_HEIGHT + 1,
            },
        ])('Returns true for locations that are overlapping with edges %p', (intersectBox) => {
            expect(testArea.overlaps(new ConversationArea({ id: 'testArea', occupants: [], type: 'ConversationArea' }, intersectBox, mock()))).toBe(true);
        });
        it.each([
            { x: x - 50, y: y - 50, width: 10, height: 10 },
            { x: x - 50, y: y + height + 50, width: 10, height: 10 },
            { x: x + width + 50, y: y - 50, width: 100, height: 100 },
            { x: x + width + 50, y: y + height + 50, width: 100, height: 100 },
            {
                x: x - PLAYER_SPRITE_WIDTH * 1.5,
                y: y - PLAYER_SPRITE_HEIGHT * 1.5,
                width: PLAYER_SPRITE_WIDTH / 2,
                height: PLAYER_SPRITE_HEIGHT / 2,
            },
            {
                x: x - PLAYER_SPRITE_WIDTH,
                y: y + height + PLAYER_SPRITE_HEIGHT,
                width: PLAYER_SPRITE_WIDTH,
                height: PLAYER_SPRITE_HEIGHT,
            },
            {
                x: x + width + PLAYER_SPRITE_WIDTH,
                y: y - PLAYER_SPRITE_HEIGHT,
                width: PLAYER_SPRITE_WIDTH,
                height: PLAYER_SPRITE_HEIGHT,
            },
            {
                x: x + width + PLAYER_SPRITE_WIDTH,
                y: y + height + PLAYER_SPRITE_HEIGHT,
                width: PLAYER_SPRITE_WIDTH,
                height: PLAYER_SPRITE_HEIGHT,
            },
        ])('Returns false for locations that have no overlap %p', (intersectBox) => {
            expect(testArea.overlaps(new ConversationArea({ id: 'testArea', occupants: [], type: 'ConversationArea' }, intersectBox, mock()))).toBe(false);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZXJhY3RhYmxlQXJlYS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Rvd24vSW50ZXJhY3RhYmxlQXJlYS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDckQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUNoQyxPQUFPLE1BQU0sTUFBTSxlQUFlLENBQUM7QUFDbkMsT0FBTyxFQUFFLGVBQWUsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQVNwRSxPQUFPLGdCQUFnQixNQUFNLG9CQUFvQixDQUFDO0FBQ2xELE9BQU8sZ0JBQWdCLEVBQUUsRUFBRSxvQkFBb0IsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRWpHLE1BQU0sb0JBQXFCLFNBQVEsZ0JBQWdCO0lBQzFDLGFBQWE7UUFHbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFTSxPQUFPO1FBQ1osT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFFLENBQUM7SUFDbEUsQ0FBQztDQUNGO0FBQ0QsTUFBTSxNQUFNLEdBQUcsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sTUFBTSxHQUFHLG9CQUFvQixHQUFHLENBQUMsQ0FBQztBQUV4QyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO0lBQ2hDLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ2hFLElBQUksUUFBMEIsQ0FBQztJQUMvQixNQUFNLEVBQUUsR0FBRyxNQUFNLEVBQUUsQ0FBQztJQUNwQixJQUFJLFNBQWlCLENBQUM7SUFDdEIsTUFBTSxXQUFXLEdBQUcsSUFBSSxFQUFlLENBQUM7SUFFeEMsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN2QixRQUFRLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxFQUFFLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ2xFLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQWUsQ0FBQyxDQUFDO1FBQ3RELFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDMUIsQ0FBQyxDQUFDLENBQUM7SUFDSCxRQUFRLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRTtRQUNuQixFQUFFLENBQUMsdUNBQXVDLEVBQUUsR0FBRyxFQUFFO1lBQy9DLE1BQU0sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDekQsQ0FBQyxDQUFDLENBQUM7UUFDSCxFQUFFLENBQUMsNEVBQTRFLEVBQUUsR0FBRyxFQUFFO1lBQ3BGLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUV0RCxNQUFNLG1CQUFtQixHQUFHLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUM1RSxNQUFNLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRSxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0gsUUFBUSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7UUFDdEIsRUFBRSxDQUFDLCtDQUErQyxFQUFFLEdBQUcsRUFBRTtZQUN2RCxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLDhFQUE4RSxFQUFFLEdBQUcsRUFBRTtZQUN0RixTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdkIsUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMzQixNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUMxRCxNQUFNLG1CQUFtQixHQUFHLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUM1RSxNQUFNLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3RFLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDSCxRQUFRLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRTtRQUN4QixFQUFFLENBQUMsaURBQWlELEVBQUUsR0FBRyxFQUFFO1lBQ3pELE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLHFEQUFxRCxFQUFFLEdBQUcsRUFBRTtZQUM3RCxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDSCxRQUFRLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO1FBQ3RDLElBQUksYUFBdUIsQ0FBQztRQUM1QixJQUFJLGdCQUEwQixDQUFDO1FBQy9CLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZCxhQUFhLEdBQUcsRUFBRSxDQUFDO1lBQ25CLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztZQUN0QixNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDO1lBQ2pDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzNCLE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBZSxDQUFDLENBQUM7Z0JBQ3pELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7Z0JBQzFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBQzNDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDNUI7WUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMzQixNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQWUsQ0FBQyxDQUFDO2dCQUN6RCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztnQkFDekIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7Z0JBQ3pCLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUMvQjtZQUNELE1BQU0sWUFBWSxHQUFHLGFBQWE7aUJBQy9CLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztpQkFDeEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2hELENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLDhDQUE4QyxFQUFFLEdBQUcsRUFBRTtZQUN0RCxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FDaEMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FDL0QsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLCtDQUErQyxFQUFFLEdBQUcsRUFBRTtZQUN2RCxhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQzdCLE1BQU0sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQzlELENBQUM7WUFDRixNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0QsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUNILFFBQVEsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFO1FBQ3hCLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxXQUFXLENBQUM7UUFDNUMsRUFBRSxDQUFDLElBQUksQ0FBSztZQUNWLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsRUFBRTtZQUN0QyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLENBQUMsRUFBRTtZQUNoRCxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM5QixFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3RCLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sRUFBRTtZQUN2QyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sRUFBRTtTQUNoQyxDQUFDLENBQUMsMkRBQTJELEVBQUUsQ0FBQyxRQUFZLEVBQUUsRUFBRTtZQUMvRSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsZUFBZSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9GLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLElBQUksQ0FBSztZQUNWLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLEVBQUU7WUFDaEQsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxFQUFFO1lBQ3hDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcsTUFBTSxFQUFFO1lBQ3pELEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRyxNQUFNLEVBQUU7U0FDbEQsQ0FBQyxDQUNBLDBJQUEwSSxFQUMxSSxDQUFDLFFBQVksRUFBRSxFQUFFO1lBQ2YsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLGVBQWUsRUFBRSxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDcEYsSUFBSSxDQUNMLENBQUM7UUFDSixDQUFDLENBQ0YsQ0FBQztRQUNGLEVBQUUsQ0FBQyxJQUFJLENBQUs7WUFDVixFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRTtZQUN4QyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFO1lBQ2hDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEdBQUcsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxHQUFHLE1BQU0sRUFBRTtZQUNqRCxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxHQUFHLE1BQU0sRUFBRTtTQUMxQyxDQUFDLENBQUMsbUVBQW1FLEVBQUUsQ0FBQyxRQUFZLEVBQUUsRUFBRTtZQUN2RixNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsZUFBZSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hHLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLElBQUksQ0FBSztZQUNWLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFO1lBQ25DLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUU7WUFDOUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3ZDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ25DLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUU7WUFDM0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUMxQixFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM5QixFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsRUFBRTtTQUNoQyxDQUFDLENBQUMsMERBQTBELEVBQUUsQ0FBQyxRQUFZLEVBQUUsRUFBRTtZQUM5RSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsZUFBZSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hHLENBQUMsQ0FB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