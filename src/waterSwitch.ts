import * as $ from 'jquery';
import { LightSwitch } from './lightSwitch';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';

/**
 * WaterSwitch --- Renders the water switch in on/off configuration
 * and responds to user interaction
 *
 * Display an On/Off switch, where On = 100% water, Off = 0% water
 *
 * When the water switch is requested during an animation cycle, a wait image 
 * will be displayed.
 *
 * @author Jonathan Lim-Breitbart
 */
export class WaterSwitch extends LightSwitch {

  constructor(simulation: PlantGlucoseSimulation, show: boolean = true) {
    super(simulation, show);
  }

  setControls() {
    this.waitImage = $('#waitImage');
    this.switchControls = $('#waterSwitch');
    this.switchInput = $('#waterSwitchInput');
  }


  listenForUserInput() {
    const thisSwitch = this;
    this.switchInput.on('change', function() {
      const switchValue = $(this).val();
      if (switchValue == thisSwitch.INPUT_VALUE_POWER_OFF) {
        thisSwitch.simulation.addEvent('turnWaterOffButtonClicked');
        thisSwitch.simulation.handleWaterChangeRequest(0);
      } else if (switchValue == thisSwitch.INPUT_VALUE_POWER_ON) {
        thisSwitch.simulation.addEvent('turnWaterOnButtonClicked');
        thisSwitch.simulation.handleWaterChangeRequest(4);
      }
    });
  }
}
