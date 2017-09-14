import * as $ from "jquery";
import {PlantGlucoseSimulation} from "./plantGlucoseSimulation";

/**
 * SimulationSpeedSwitch --- Controls the speed of the simulation
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class SimulationSpeedSwitch {
  SPEED_RATIO_NORMAL: number = 1;
  SPEED_RATIO_DOUBLE: number = 0.5;
  SPEED_RATIO_QUADRUPLE: number = 0.25;

  simulation: PlantGlucoseSimulation;
  waitImageLightSwitch: any;

  /**
   * Creates a new SimulationSpeedSwitch instance
   * @param simulation A reference to the simulation
   */
  constructor(simulation: PlantGlucoseSimulation) {
    this.simulation = simulation;
    this.waitImageLightSwitch = $("#waitImageLightSwitch");
    this.listenForUserInput();
  }

  /**
   * Register listeners for user changes on speed slider
   */
  listenForUserInput() {
    let speedSwitch = this;
    $("#animationSpeedSwitchInput").on("change", function() {
      let animationSpeedSwitchValue = $(this).val();
      if (animationSpeedSwitchValue == 1) {
        speedSwitch.simulation.addEvent('animationSpeedNormalClicked');
        speedSwitch.simulation
          .updateAnimationSpeedRatio(speedSwitch.SPEED_RATIO_NORMAL);
      } else if (animationSpeedSwitchValue == 2) {
        speedSwitch.simulation.addEvent('animationSpeed2xClicked');
        speedSwitch.simulation
          .updateAnimationSpeedRatio(speedSwitch.SPEED_RATIO_DOUBLE);
      } else {
        speedSwitch.simulation.addEvent('animationSpeed4xClicked');
        speedSwitch.simulation
          .updateAnimationSpeedRatio(speedSwitch.SPEED_RATIO_QUADRUPLE);
      }
    });
  }

  disableUserInput() {
    $("#animationSpeedSwitchInput").prop("disabled", true);
  }

  enableUserInput() {
    $("#animationSpeedSwitchInput").prop("disabled", false);
  }
}
