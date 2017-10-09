import * as $ from "jquery";
import {PlantGlucoseSimulation} from "./plantGlucoseSimulation";

/**
 * LightSwitch3 --- Rendering the light switch in Full/Half/Off configurations
 * and responds to user interaction
 *
 * Full = 100% energy, Half = 50% energy, and Off = 0% energy
 *
 * When the light is at Half, it shines with two photons, and two glucose
 * is produced, and both will be used and none will be left for storage.
 *
 * When the light switch is requested during an animation cycle,
 * a wait image will be displayed.
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class LightSwitch3 {
  INPUT_VALUE_POWER_OFF = 0;
  INPUT_VALUE_POWER_HALF = 1;
  INPUT_VALUE_POWER_FULL = 2;

  lightSwitchControls: any;
  simulation: PlantGlucoseSimulation;
  waitImageLightSwitch: any;

  constructor(simulation: PlantGlucoseSimulation) {
    this.simulation = simulation;
    this.waitImageLightSwitch = $("#waitImageLightSwitch");
    this.lightSwitchControls = $(".lightSwitch3");
    this.lightSwitchControls.show();
    this.listenForUserInput();
  }

  listenForUserInput() {
    let lightSwitch = this;
    $("#lightSwitchInput3").on("change", function () {
      let lightSwitchValue = $(this).val();
      if (lightSwitchValue == lightSwitch.INPUT_VALUE_POWER_OFF) {
        lightSwitch.simulation.addEvent('turnLightOffButtonClicked');
        lightSwitch.simulation.handleLightChangeRequest(0);
      } else if (lightSwitchValue == lightSwitch.INPUT_VALUE_POWER_HALF) {
        lightSwitch.simulation.addEvent('turnLightHalfButtonClicked');
        lightSwitch.simulation.handleLightChangeRequest(2);
      } else if (lightSwitchValue == lightSwitch.INPUT_VALUE_POWER_FULL) {
        lightSwitch.simulation.addEvent('turnLightFullButtonClicked');
        lightSwitch.simulation.handleLightChangeRequest(4);
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
