import * as SVG from 'svg.js';
type SVG = typeof SVG;
import { eventBus } from './eventBus';
import { DisplayStatusMessage } from './displayStatusMessage';

/**
 * SimulationEndFeedback --- Shows feedback that the simulation has ended,
 * either by completing the entire duration, or the plant dying midway.
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
export class SimulationEndFeedback {
  private plantAlive: DisplayStatusMessage;
  private plantDied: DisplayStatusMessage;
  private simulationEnded: DisplayStatusMessage;

  /**
   * Instantiates variables with initial values for the feedback
   * @param draw the SVG object where the view will be drawn on
   */
  constructor(draw: SVG, showOrganelles: boolean) {
    this.simulationEnded = new DisplayStatusMessage(
      draw,
      showOrganelles,
      'lightblue',
      'Simulation ended',
      85
    );
    this.plantAlive = new DisplayStatusMessage(
      draw,
      showOrganelles,
      '#33FF00',
      'The plant is alive',
      72
    );
    this.plantDied = new DisplayStatusMessage(
      draw,
      showOrganelles,
      '#FF0000',
      'The plant has died',
      50
    );
    eventBus.on('statusChanged').subscribe((status: string) => {
      switch (status) {
        case 'died':
          this.plantDied.showMessage();
          break;
        case 'survived':
          this.plantAlive.showMessage();
          break;
        case 'ended':
          this.simulationEnded.showMessage();
          break;
      }
    });
  }
}
