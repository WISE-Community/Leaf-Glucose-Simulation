import * as SVG from 'svg.js';
type SVG = typeof SVG;
import { eventBus } from './eventBus';
import { DisplayStatusMessage } from './displayStatusMessage';

export class ScheduleChangedUpdate {
  private scheduleUpdateMessage: DisplayStatusMessage;
  private isShowing: boolean;

  constructor(draw: SVG, showOrganelles: boolean) {
    this.createMessage(draw, showOrganelles);
    this.isShowing = false;
    eventBus.on('scheduleUpdated').subscribe(() => this.afterScheduleUpdated());
    eventBus.on('playPauseButtonClicked').subscribe(() => this.hideMessage());
    eventBus.on('resetButtonClicked').subscribe(() => this.hideMessage());
  }

  private createMessage(draw: any, showOrganelles: boolean): void {
    this.scheduleUpdateMessage = new DisplayStatusMessage(
      draw,
      showOrganelles,
      '#ffff99',
      'Schedule updated',
      50
    );
  }

  private afterScheduleUpdated(): void {
    if (this.isShowing) {
      this.scheduleUpdateMessage.hideMessage();
      setTimeout(() => this.scheduleUpdateMessage.showMessage(), 500);
    } else {
      this.scheduleUpdateMessage.showMessage();
      this.isShowing = true;
    }
  }

  private hideMessage() {
    this.scheduleUpdateMessage.hideMessage();
    this.isShowing = false;
  }
}
