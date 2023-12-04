/**
 * This is intended to function as a transporter, but prompt the user first before teleporting them.
 */

import { KnownInteractableTypes } from '../Interactable';
import Transporter from './Transporter';

export default class PromptTransporter extends Transporter {
  private _infoTextBox?: Phaser.GameObjects.Text;

  getType(): KnownInteractableTypes {
    return 'promptTransporter';
  }

  addedToScene(): void {
    super.addedToScene();
    this.setVisible(true);
    this.setTintFill();
    this.setAlpha(0.3);
    this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y - this.displayHeight / 2,
      this.name,
      { color: '#FFFFFF', backgroundColor: '#CC0000' },
    );
  }

  private _showInfoBox() {
    if (!this._infoTextBox) {
      this._infoTextBox = this.scene.add
        .text(
          this.scene.scale.width / 2,
          this.scene.scale.height / 2,
          this.getData('infoText') as string,
          { color: '#FFFFFF', backgroundColor: '#CC0000' },
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

  public transport(): void {
    super.overlap();
  }

  public destinationType(): string {
    return this.getData('dest');
  }
}
