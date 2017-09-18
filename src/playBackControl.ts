import * as $ from "jquery";
import { PlantGlucoseSimulation } from "./plantGlucoseSimulation";
import { SimulationState } from "./simulationState";

/**
 * PlayBackControl --- Allows user to play, pause and reset the simulation
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class PlayBackControl {
  playPauseButton: any;
  resetButton: any;
  simulation: PlantGlucoseSimulation;

  constructor(simulation: PlantGlucoseSimulation) {
    this.playPauseButton = $("#playPause");
    this.resetButton = $("#reset");
    this.simulation = simulation;
    this.listenForUserInput();
  }

  /**
   * listens for user interactions with the play/pause/reset buttons
   */
  listenForUserInput() {
    this.playPauseButton.on("click", () => {
      if (this.simulation.isControlEnabled) {
        if (this.simulation.isSimulationStopped()) {
          this.simulation.addEvent('startButtonClicked');
          this.simulation.startSimulation();
          this.showPauseButton();
        } else if (this.simulation.isSimulationPaused()) {
          this.simulation.addEvent('resumeButtonClicked');
          this.simulation.resumeSimulation();
          this.showPauseButton();
        } else if (this.simulation.isSimulationRunning()) {
          this.simulation.addEvent('pauseButtonClicked');
          this.simulation.pauseSimulation();
          this.showPlayButton();
        }
      }
    });

    this.resetButton.on("click", () => {
      this.simulation.addEvent('resetButtonClicked');
      this.simulation.resetSimulation();
    });
  }

  showPauseButton() {
    this.playPauseButton.attr("src", "images/pauseCircle.png");
  }

  showPlayButton() {
    this.playPauseButton.attr("src", "images/playCircle.png");
  }
}
