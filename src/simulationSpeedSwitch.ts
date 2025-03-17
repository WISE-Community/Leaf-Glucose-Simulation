import * as $ from 'jquery';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
import { eventBus } from './eventBus';

/**
 * SimulationSpeedSwitch --- Controls the speed of the simulation
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class SimulationSpeedSwitch {
  private SPEED_RATIO_NORMAL: number = 1;
  private SPEED_RATIO_DOUBLE: number = this.SPEED_RATIO_NORMAL / 2;
  private SPEED_RATIO_QUADRUPLE: number = this.SPEED_RATIO_NORMAL / 4;

  /**
   * Creates a new SimulationSpeedSwitch instance
   * @param simulation A reference to the simulation
   */
  constructor(private simulation: PlantGlucoseSimulation) {
    this.listenForUserInput();
  }

  /**
   * Register listeners for user changes on speed slider
   */
  private listenForUserInput(): void {
    const speedSwitch = this;
    $('#animationSpeedSwitchInput').on('change', function () {
      let animationSpeedSwitchValue = $(this).val();
      if (animationSpeedSwitchValue == 1) {
        speedSwitch.simulation.addEvent('animationSpeedNormalClicked');
        speedSwitch.simulation.updateAnimationSpeedRatio(
          speedSwitch.SPEED_RATIO_NORMAL
        );
      } else if (animationSpeedSwitchValue == 2) {
        speedSwitch.simulation.addEvent('animationSpeed2xClicked');
        speedSwitch.simulation.updateAnimationSpeedRatio(
          speedSwitch.SPEED_RATIO_DOUBLE
        );
      } else {
        speedSwitch.simulation.addEvent('animationSpeed4xClicked');
        speedSwitch.simulation.updateAnimationSpeedRatio(
          speedSwitch.SPEED_RATIO_QUADRUPLE
        );
      }
    });
  }
}
