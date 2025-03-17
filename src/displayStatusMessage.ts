import * as SVG from 'svg.js';
type SVG = typeof SVG;
import { eventBus } from './eventBus';

export class DisplayStatusMessage {
  private textBox: SVG;
  private text: SVG;

  constructor(
    draw: SVG,
    showOrganelles: boolean,
    color: string,
    text: string,
    xOffsetText: number
  ) {
    const x = showOrganelles ? 250 : 0;
    this.textBox = draw
      .rect(500, 100)
      .x(x)
      .y(400)
      .fill(color)
      .stroke({ width: 2 })
      .opacity(1)
      .attr({ 'fill-opacity': 1 })
      .hide();

    this.text = draw
      .text(text)
      .x(x + xOffsetText)
      .y(410)
      .font({ size: 48 })
      .hide();

    eventBus.on('simulationReset').subscribe(() => this.hideMessage());
  }

  hideMessage() {
    this.textBox.hide();
    this.text.hide();
  }

  showMessage() {
    this.textBox.show().front();
    this.text.show().front();
  }
}
