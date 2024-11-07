import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
import { ControlButton } from './controlButton';
import { eventBus } from './eventBus';

/**
 * Button to let the user reset the simulation
 */
export class ResetButton extends ControlButton {
  constructor(protected simulation: PlantGlucoseSimulation) {
    super(simulation, '#reset');
  }

  protected onClickListener(): void {
    eventBus.emit('resetButtonClicked');
  }
}
