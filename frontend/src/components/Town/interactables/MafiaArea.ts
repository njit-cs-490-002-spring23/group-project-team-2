import TownController from '../../../classes/TownController';
import Interactable, { KnownInteractableTypes } from '../Interactable';
import TownGameScene from '../TownGameScene';
import { BoundingBox } from '../../../types/CoveyTownSocket';
import GameArea from './GameArea';

export default class MafiaArea extends GameArea {
    private _townController: TownController;

    private _infoTextBox?: Phaser.GameObjects.Text;

    constructor(scene: TownGameScene) {
        super(scene);
        this._townController = scene.coveyTownController;
        this.setTintFill();
        this.setAlpha(0.3);
    }

    removedFromScene(): void {}

    addedToScene(): void {
        super.addedToScene();
        this.scene.add.text(
          this.x - this.displayWidth / 2,
          this.y - this.displayHeight / 2,
          this.name,
          { color: '#FFFFFF', backgroundColor: '#000000' },
        );
      }

    getType(): KnownInteractableTypes {
        return 'mafiaArea';
    }

    public getBoundingBox(): BoundingBox {
        const { x, y, width, height } = this.getBounds();
        return { x, y, width, height };
      }

      private _showInfoBox() {
        if (!this._infoTextBox) {
          this._infoTextBox = this.scene.add
            .text(
              this.scene.scale.width / 2,
              this.scene.scale.height / 2,
              "You've found a game of mafia, press space if you would like to join!",
              { color: '#000000', backgroundColor: '#FFFFFF' },
            )
            .setScrollFactor(0)
            .setDepth(30);
        }
        this._infoTextBox.setVisible(true);
        this._infoTextBox.x = this.scene.scale.width / 2 - this._infoTextBox.width / 2;
      }

      overlap(): void {
        this._showInfoBox();
      }

      overlapExit(): void {
        this._infoTextBox?.setVisible(false);
      }
}