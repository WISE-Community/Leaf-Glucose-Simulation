import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
import { ControlButton } from './controlButton';

/**
 * Button to let the user reset the simulation
 */
export class ResetButton extends ControlButton {
  constructor(protected simulation: PlantGlucoseSimulation) {
    super(simulation, 'resetButton');
  }
}
