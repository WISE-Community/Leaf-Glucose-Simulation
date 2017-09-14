import * as SVG from "svg.js";

/**
 * SimulationEndFeedback --- Shows feedback that the simulation has ended,
 * either by completing the entire duration, or the plant dying midway.
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class SimulationEndFeedback {
  draw: SVG;
  plantDiedRect: SVG;
  plantDiedText: SVG;
  simulationEndedRect: SVG;
  simulationEndedText: SVG;

  /**
   * Instantiates variables with initial values for the feedback
   * @param draw the SVG object where the view will be drawn on
   */
  constructor(draw: SVG) {
    this.draw = draw;

    this.simulationEndedRect = this.draw.rect(500, 100).x(250).y(400)
      .fill('lightblue').stroke({width:2})
      .opacity(1).attr({ 'fill-opacity': 1 }).hide();

    this.simulationEndedText = this.draw.text('Simulation ended')
      .x(315).y(410).font({size: 48}).hide();

    this.plantDiedRect = this.draw.rect(500, 100).x(250).y(400)
      .fill('red').stroke({width:2}).opacity(1).attr({
        'fill-opacity': 1
      }).hide();

    this.plantDiedText = this.draw.text('The plant has died')
      .x(315).y(410).font({size: 48}).hide();
  }

  /**
   * Hide the 'Simulation Ended' and 'plant died' messages
   */
  hideAll() {
    this.plantDiedRect.hide();
    this.plantDiedText.hide();
    this.simulationEndedRect.hide();
    this.simulationEndedText.hide();
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
}
