import * as SVG from 'svg.js';
type SVG = typeof SVG;
import { eventBus } from './eventBus';
import { DisplayStatusMessage } from './displayStatusMessage';

export class ScheduleChangedUpdate {
  private scheduleUpdateMessage: DisplayStatusMessage;

  constructor(draw: SVG, showOrganelles: boolean) {
    this.createMessage(draw, showOrganelles);
    this.addEventListener();
  }

  private createMessage(draw: any, showOrganelles: boolean) {
    this.scheduleUpdateMessage = new DisplayStatusMessage(
      draw,
      showOrganelles,
      '#ffff99',
      'Schedule updated',
      50
    );
  }

  private addEventListener() {
    eventBus.on('scheduleUpdated').subscribe(() => {
      this.scheduleUpdateMessage.showMessage();
      setTimeout(() => this.scheduleUpdateMessage.hideMessage(), 2000);
    });
  }
}
