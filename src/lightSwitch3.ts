import * as $ from 'jquery';
import { LightSwitch } from './lightSwitch';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';

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
 * @author Jonathan Lim-Breitbart
 */
export class LightSwitch3 extends LightSwitch {
  INPUT_VALUE_POWER_HALF = 1;
  INPUT_VALUE_POWER_FULL = 2;

  constructor(simulation: PlantGlucoseSimulation, show: boolean = true) {
    super(simulation, show);
  }

  setControls() {
    this.waitImage = $('#waitImageLightSwitch');
    this.switchControls = $('#lightSwitch3');
    this.switchInput = $('#switchInput3');
  }

  listenForUserInput() {
    const thisSwitch = this;
    this.switchInput.on('change', function () {
      const switchValue = $(this).val();
      if (switchValue == thisSwitch.INPUT_VALUE_POWER_OFF) {
        thisSwitch.simulation.addEvent('turnLightOffButtonClicked');
        thisSwitch.simulation.handleLightChangeRequest(0);
      } else if (switchValue == thisSwitch.INPUT_VALUE_POWER_HALF) {
        thisSwitch.simulation.addEvent('turnLightHalfButtonClicked');
        thisSwitch.simulation.handleLightChangeRequest(2);
      } else if (switchValue == thisSwitch.INPUT_VALUE_POWER_FULL) {
        thisSwitch.simulation.addEvent('turnLightFullButtonClicked');
        thisSwitch.simulation.handleLightChangeRequest(4);
      }
    });
  }
}
