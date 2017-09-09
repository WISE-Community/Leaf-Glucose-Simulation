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
     * Instantiates variables with initial values for the feedback.
     * @param draw the SVG object where the view will be drawn on
     */
    constructor(draw: SVG) {
        this.draw = draw;

        // create the simulation ended message
        this.simulationEndedRect = this.draw.rect(500, 100).x(250).y(400).fill('lightblue').stroke({width:2})
            .opacity(1).attr({ 'fill-opacity': 1 });

        // create the message text
        this.simulationEndedText = this.draw.text('Simulation ended').x(315).y(410).font({size: 48});

        // hide the elements until we want to show them
        this.simulationEndedRect.hide();
        this.simulationEndedText.hide();

        // Create the plant died message
        this.plantDiedRect = this.draw.rect(500, 100).x(250).y(400).fill('red').stroke({width:2}).opacity(1).attr({
            'fill-opacity': 1
        });

        this.plantDiedText = this.draw.text('The plant has died').x(315).y(410).font({size: 48});

        // hide the elements until we want to show them
        this.plantDiedRect.hide();
        this.plantDiedText.hide();

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
     * Shows plant died feedback
     */
    showPlantDied() {
        // move the plant died elements in front of everything
        this.plantDiedRect.front();
        this.plantDiedText.front();

        // show the plant died message
        this.plantDiedRect.show();
        this.plantDiedText.show();
    }

    /**
     * Shows simulation ended feedback
     */
    showSimulationEnded() {
        // move the simulation ended elements in front of everything
        this.simulationEndedRect.front();
        this.simulationEndedText.front();

        // show the simulation ended message
        this.simulationEndedRect.show();
        this.simulationEndedText.show();
    }
}
