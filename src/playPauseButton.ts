import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
import { ControlButton } from './controlButton';
import { eventBus } from './eventBus';
import { SimulationState } from './simulationState';

/**
 * Button to let the user play and pause the simulation
 */
export class PlayPauseButton extends ControlButton {
  constructor(protected simulation: PlantGlucoseSimulation) {
    super(simulation, '#playPause');
    eventBus.on('readyToPlay').subscribe(() => this.showPlayButton());
    eventBus.on('simulationStateChanged').subscribe((state) => {
      if (state === SimulationState.Paused) {
        this.showPlayButton();
      } else {
        this.showPauseButton();
      }
    });
  }

  protected onClickListener(): void {
    eventBus.emit('playPauseButtonClicked');
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
