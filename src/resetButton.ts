import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
import { ControlButton } from './controlButton';

/**
 * Button to let the user reset the simulation
 */
export class ResetButton extends ControlButton {
  constructor(simulation: PlantGlucoseSimulation) {
    super(simulation, '#reset');
  }

  onClickListener(): void {
    this.simulation.addEvent('resetButtonClicked');
    this.simulation.resetSimulation();
  }
}
