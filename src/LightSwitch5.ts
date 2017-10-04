import * as $ from "jquery";
import {PlantGlucoseSimulation} from "./plantGlucoseSimulation";

/**
 * LightSwitch5 --- Rendering the light switch in these configurations:
 * 100% (4 glucose produced)
 * 75% (3 glucose produced)
 * 50% (2 glucose produced)
 * 25% (1 glucose produced)
 * OFF (0 glucose produced)
 * and responds to user interaction.
 *
 * When the light switch is requested during an animation cycle,
 * a wait image will be displayed.

 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class LightSwitch5 {
  INPUT_VALUE_POWER_OFF = 0;
  INPUT_VALUE_POWER_25 = 1
  INPUT_VALUE_POWER_50 = 2;
  INPUT_VALUE_POWER_75 = 3;
  INPUT_VALUE_POWER_FULL = 4;

  lightSwitchControls: any;
  simulation: PlantGlucoseSimulation;
  waitImageLightSwitch: any;

  constructor(simulation: PlantGlucoseSimulation) {
    this.simulation = simulation;
    this.waitImageLightSwitch = $("#waitImageLightSwitch");
    this.lightSwitchControls = $(".lightSwitch5");
    this.lightSwitchControls.show();
    this.listenForUserInput();
  }

  listenForUserInput() {
    let lightSwitch = this;
    $("#lightSwitchInput5").on("change", function () {
      let lightSwitchValue = $(this).val();
      if (lightSwitchValue == lightSwitch.INPUT_VALUE_POWER_OFF) {
        lightSwitch.simulation.addEvent('turnLightOffButtonClicked');
        lightSwitch.simulation
            .handleLightChangeRequest(lightSwitch.INPUT_VALUE_POWER_OFF);
      } else if (lightSwitchValue == lightSwitch.INPUT_VALUE_POWER_25) {
        lightSwitch.simulation.addEvent('turnLight25ButtonClicked');
        lightSwitch.simulation
            .handleLightChangeRequest(lightSwitch.INPUT_VALUE_POWER_25);
      } else if (lightSwitchValue == lightSwitch.INPUT_VALUE_POWER_50) {
        lightSwitch.simulation.addEvent('turnLight50ButtonClicked');
        lightSwitch.simulation
            .handleLightChangeRequest(lightSwitch.INPUT_VALUE_POWER_50);
      } else if (lightSwitchValue == lightSwitch.INPUT_VALUE_POWER_75) {
        lightSwitch.simulation.addEvent('turnLight75ButtonClicked');
        lightSwitch.simulation
            .handleLightChangeRequest(lightSwitch.INPUT_VALUE_POWER_75);
      } else if (lightSwitchValue == lightSwitch.INPUT_VALUE_POWER_FULL) {
        lightSwitch.simulation.addEvent('turnLightFullButtonClicked');
        lightSwitch.simulation
            .handleLightChangeRequest(lightSwitch.INPUT_VALUE_POWER_FULL);
      }
    });
  }

  hideWaitImage() {
    this.waitImageLightSwitch.fadeOut();
  }

  showWaitImage() {
    this.waitImageLightSwitch.show();
  }

  disableUserInput() {
    this.lightSwitchControls.prop("disabled", true);
  }

  enableUserInput() {
    this.lightSwitchControls.prop("disabled", false);
  }
}
