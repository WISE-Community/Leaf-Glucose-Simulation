import * as SVG from 'svg.js';
type SVG = typeof SVG;
import { eventBus } from './eventBus';

/**
 * SimulationEndFeedback --- Shows feedback that the simulation has ended,
 * either by completing the entire duration, or the plant dying midway.
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
export class SimulationEndFeedback {
  plantAliveRect: SVG;
  plantAliveText: SVG;
  plantDiedRect: SVG;
  plantDiedText: SVG;
  simulationEndedRect: SVG;
  simulationEndedText: SVG;

  /**
   * Instantiates variables with initial values for the feedback
   * @param draw the SVG object where the view will be drawn on
   */
  constructor(draw: SVG, showOragnelles: boolean) {
    const x = showOragnelles ? 250 : 0;
    this.simulationEndedRect = draw
      .rect(500, 100)
      .x(x)
      .y(400)
      .fill('lightblue')
      .stroke({ width: 2 })
      .opacity(1)
      .attr({ 'fill-opacity': 1 })
      .hide();

    this.simulationEndedText = draw
      .text('Simulation ended')
      .x(x + 85)
      .y(410)
      .font({ size: 48 })
      .hide();

    this.plantAliveRect = draw
      .rect(500, 100)
      .x(x)
      .y(400)
      .fill('#33FF00')
      .stroke({ width: 2 })
      .opacity(1)
      .attr({ 'fill-opacity': 1 })
      .hide();

    this.plantAliveText = draw
      .text('The plant is alive')
      .x(x + 72)
      .y(410)
      .font({ size: 48 })
      .hide();

    this.plantDiedRect = draw
      .rect(500, 100)
      .x(x)
      .y(400)
      .fill('#FF0000')
      .stroke({ width: 2 })
      .opacity(1)
      .attr({ 'fill-opacity': 1 })
      .hide();

    this.plantDiedText = draw
      .text('The plant has died')
      .x(x + 50)
      .y(410)
      .font({ size: 48, fill: 'white' })
      .hide();
    eventBus.on('simulationReset').subscribe(() => this.hideAll());
    eventBus.on('statusChanged').subscribe((status: string) => {
      switch (status) {
        case 'died':
          this.showPlantDied();
          break;
        case 'survived':
          this.showPlantAlive();
          break;
        case 'ended':
          this.showSimulationEnded();
          break;
      }
    });
  }

  /**
   * Hide the 'Simulation Ended' and 'plant died' messages
   */
  private hideAll(): void {
    this.plantDiedRect.hide();
    this.plantDiedText.hide();
    this.simulationEndedRect.hide();
    this.simulationEndedText.hide();
    this.plantAliveRect.hide();
    this.plantAliveText.hide();
  }

  /**
   * Shows plant died feedback and bring it to the front
   */
  showPlantDied() {
    this.plantDiedRect.front();
    this.plantDiedText.front();
    this.plantDiedRect.show();
    this.plantDiedText.show();
  }

  /**
   * Shows simulation ended feedback and bring it to the front
   */
  showSimulationEnded() {
    this.simulationEndedRect.front();
    this.simulationEndedText.front();
    this.simulationEndedRect.show();
    this.simulationEndedText.show();
  }

  /**
   * Shows plant alive feedback and bring it to the front
   */
  showPlantAlive() {
    this.plantAliveRect.front();
    this.plantAliveText.front();
    this.plantAliveRect.show();
    this.plantAliveText.show();
  }
}
