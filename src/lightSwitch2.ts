import * as $ from "jquery";
import {PlantGlucoseSimulation} from "./plantGlucoseSimulation";

/**
 * LightSwitch --- Renders the light switch in on/off configuration
 * and responds to user interaction
 *
 * Display an On/Off switch, where On = 100% energy, Off = 0% energy
 *
 * When the light switch is requested during an animation cycle,
 *   a wait image will be displayed.
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class LightSwitch2 {
  INPUT_VALUE_POWER_OFF = 0;
  INPUT_VALUE_POWER_ON = 1;

  lightSwitchControls: any;
  simulation: PlantGlucoseSimulation;
  waitImageLightSwitch: any;

  /**
   * Creates a new LightSwitch2 instance
   * @param simulation A reference to the simulation
   */
  constructor(simulation: PlantGlucoseSimulation) {
    this.simulation = simulation;
    this.waitImageLightSwitch = $("#waitImageLightSwitch");
    this.lightSwitchControls = $(".lightSwitch2");
    this.lightSwitchControls.show();
    this.listenForUserInput();
  }

  /**
   * Register listeners for user interactions like
   * when the user changes the value of the light switch slider
   */
  listenForUserInput() {
    let lightSwitch = this;
    $("#lightSwitchInput2").on("change", function() {
      let lightSwitchValue = $(this).val();
      if (lightSwitchValue == lightSwitch.INPUT_VALUE_POWER_OFF) {
        lightSwitch.simulation.addEvent('turnLightOffButtonClicked');
        lightSwitch.simulation.handleLightChangeRequest(0 /* light off */);
      } else if (lightSwitchValue == lightSwitch.INPUT_VALUE_POWER_ON) {
        lightSwitch.simulation.addEvent('turnLightOnButtonClicked');
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
