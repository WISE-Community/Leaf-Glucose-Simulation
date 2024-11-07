import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
import { ControlButton } from './controlButton';
import { eventBus } from './eventBus';
import { SimulationState } from './simulationState';

/**
 * Button to let the user play and pause the simulation
 */
export class PlayPauseButton extends ControlButton {
  constructor(protected simulation: PlantGlucoseSimulation) {
    super(simulation, 'playPauseButton');
    eventBus.on('readyToPlay').subscribe(() => this.showPlayButton());
    eventBus.on('simulationStateChanged').subscribe((state) => {
      if (state === SimulationState.Paused) {
        this.showPlayButton();
      } else {
        this.showPauseButton();
      }
    });
  }

  private showPauseButton(): void {
    this.updateButton('images/pauseCircle.png', 'Pause', 'Pause simulation');
  }

  private showPlayButton(): void {
    this.updateButton('images/playCircle.png', 'Play', 'Play simulation');
  }

  private updateButton(src: string, alt: string, ariaLabel: string): void {
    this.button.attr('src', src);
    this.button.attr('alt', alt);
    this.button.attr('aria-label', ariaLabel);
  }
}
