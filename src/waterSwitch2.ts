import * as $ from 'jquery';
import {PlantGlucoseSimulation} from './plantGlucoseSimulation';

/**
 * WaterSwitch2 --- Renders the water switch in on/off configuration
 * and responds to user interaction
 *
 * Display an On/Off switch, where On = 100% water, Off = 0% water
 *
 * When the water switch is requested during an animation cycle, a wait image 
 * will be displayed.
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
export class WaterSwitch2 {
  INPUT_VALUE_POWER_OFF = 0;
  INPUT_VALUE_POWER_ON = 1;

  waterSwitchControls: any;
  simulation: PlantGlucoseSimulation;
  waitImageWaterSwitch: any;

  constructor(simulation: PlantGlucoseSimulation) {
    this.simulation = simulation;
    this.waitImageWaterSwitch = $('#waitImageLightSwitch');
    this.waterSwitchControls = $('#waterSwitch');
    this.waterSwitchControls.show();
    this.listenForUserInput();
  }

  listenForUserInput() {
    let waterSwitch = this;
    $('#waterSwitchInput2').on('change', function() {
      let waterSwitchValue = $(this).val();
      if (waterSwitchValue == waterSwitch.INPUT_VALUE_POWER_OFF) {
        waterSwitch.simulation.addEvent('turnWaterOffButtonClicked');
        waterSwitch.simulation.handleWaterChangeRequest(0);
      } else if (waterSwitchValue == waterSwitch.INPUT_VALUE_POWER_ON) {
        waterSwitch.simulation.addEvent('turnWaterOnButtonClicked');
        waterSwitch.simulation.handleWaterChangeRequest(4);
      }
    });
  }

  hideWaitImage() {
    this.waitImageWaterSwitch.fadeOut();
  }

  showWaitImage() {
    this.waitImageWaterSwitch.show();
  }

  disableUserInput() {
    this.waterSwitchControls.find('input').prop('disabled', true);
  }

  enableUserInput() {
    this.waterSwitchControls.find('input').prop('disabled', false);
  }
}
