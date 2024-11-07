import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
import { ControlButton } from './controlButton';
import { eventBus } from './eventBus';

/**
 * Button to let the user play and pause the simulation
 */
export class PlayPauseButton extends ControlButton {
  constructor(simulation: PlantGlucoseSimulation) {
    super(simulation, '#playPause');
    eventBus.on('readyToPlay').subscribe(() => this.showPlayButton());
  }

  onClickListener(): void {
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
  }

  private showPauseButton(): void {
    this.button.attr('src', 'images/pauseCircle.png');
    this.button.attr('alt', 'Pause');
    this.button.attr('aria-label', 'Pause simulation');
  }

  private showPlayButton(): void {
    this.button.attr('src', 'images/playCircle.png');
    this.button.attr('alt', 'Play');
    this.button.attr('aria-label', 'Play simulation');
  }
}
