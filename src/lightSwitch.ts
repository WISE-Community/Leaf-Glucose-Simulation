import * as $ from 'jquery';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';

/**
 * LightSwitch2 --- Renders the light switch in on/off configuration
 * and responds to user interaction
 *
 * Display an On/Off switch, where On = 100% energy, Off = 0% energy
 *
 * When the light switch is requested during an animation cycle,
 *   a wait image will be displayed.
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
export class LightSwitch {
  INPUT_VALUE_POWER_OFF = 0;
  INPUT_VALUE_POWER_ON = 1;

  switchControls: any;
  switchInput: any;
  show: boolean;
  simulation: PlantGlucoseSimulation;
  waitImage: any;

  constructor(simulation: PlantGlucoseSimulation, show: boolean = true) {
    this.show = show;
    this.simulation = simulation;
    this.setControls();
    if (this.show) {
      this.switchControls.show();
    }
    this.listenForUserInput();
  }

  setControls() {
    this.waitImage = $('#waitImage');
    this.switchControls = $('#lightSwitch');
    this.switchInput = $('#lightSwitchInput');
  }

  listenForUserInput() {
    const thisSwitch = this;
    this.switchInput.on('change', function() {
      const switchValue = $(this).val();
      if (switchValue == thisSwitch.INPUT_VALUE_POWER_OFF) {
        thisSwitch.simulation.addEvent('turnLightOffButtonClicked');
        thisSwitch.simulation.handleLightChangeRequest(0);
      } else if (switchValue == thisSwitch.INPUT_VALUE_POWER_ON) {
        thisSwitch.simulation.addEvent('turnLightOnButtonClicked');
        thisSwitch.simulation.handleLightChangeRequest(4);
      }
    });
  }

  hideWaitImage() {
    this.waitImage.fadeOut();
  }

  showWaitImage() {
    if (this.show) {
      this.waitImage.show();
    }
  }

  setEnableUserInput(enable: boolean) {
    if (enable) {
      this.switchControls.find('input').prop('disabled', false);
    } else {
      this.switchControls.find('input').prop('disabled', true);
    }
  }
}
