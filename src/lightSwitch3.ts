import * as $ from "jquery";
import {PlantGlucoseSimulation} from "./plantGlucoseSimulation";

/**
 * LightSwitch --- Rendering the light switch in Full/Half/Off configurations
 * and responds to user interaction
 *
 * Full = 100% energy, Half = 50% energy, and Off = 0% energy
 *
 * When the light is at Half, it shines with one photon, and two glucose
 *   get produced, which all go to get used.

 * When the light switch is requested during an animation cycle,
 *   a wait image will be displayed.

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

  /**
   * Creates a new LightSwitch3 instance
   * @param simulation A reference to the plant glucose simulation
   */
  constructor(simulation: PlantGlucoseSimulation) {
    this.simulation = simulation;
    this.waitImageLightSwitch = $("#waitImageLightSwitch");
    this.lightSwitchControls = $(".lightSwitch3");
    this.lightSwitchControls.show();
    this.listenForUserInput();
  }

  /**
   * Register listeners for user interactions like
   * when the user changes the value of the light switch slider
   */
  listenForUserInput() {
    let lightSwitch = this;
    $("#lightSwitchInput3").on("change", function () {
      let lightSwitchValue = $(this).val();
      if (lightSwitchValue == lightSwitch.INPUT_VALUE_POWER_OFF) {
        lightSwitch.simulation.addEvent('turnLightOffButtonClicked');
        lightSwitch.simulation.handleLightChangeRequest(0 /* light off */);
      } else if (lightSwitchValue == lightSwitch.INPUT_VALUE_POWER_HALF) {
        lightSwitch.simulation.addEvent('turnLightHalfButtonClicked');
        lightSwitch.simulation.handleLightChangeRequest(50 /* light half on */);
      } else if (lightSwitchValue == lightSwitch.INPUT_VALUE_POWER_FULL) {
        lightSwitch.simulation.addEvent('turnLightFullButtonClicked');
        lightSwitch.simulation.handleLightChangeRequest(100 /* light on */);
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
