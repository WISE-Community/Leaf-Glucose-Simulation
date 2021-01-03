import * as $ from 'jquery';
import { LightSwitch } from './lightSwitch';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';

/**
 * thisSwitch5 --- Rendering the light switch in these configurations:
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
export class LightSwitch5 extends LightSwitch {
  INPUT_VALUE_POWER_25 = 1;
  INPUT_VALUE_POWER_50 = 2;
  INPUT_VALUE_POWER_75 = 3;
  INPUT_VALUE_POWER_FULL = 4;

  constructor(simulation: PlantGlucoseSimulation, show: boolean = true) {
    super(simulation, show);
  }

  setControls() {
    this.waitImage = $('#waitImage');
    this.switchControls = $('#lightSwitch5');
    this.switchInput = $('#lightSwitchInput5');
  }

  listenForUserInput() {
    const thisSwitch = this;
    this.switchInput.on('change', function () {
      const switchValue = $(this).val();
      if (switchValue == thisSwitch.INPUT_VALUE_POWER_OFF) {
        thisSwitch.simulation.addEvent('turnLightOffButtonClicked');
        thisSwitch.simulation
            .handleLightChangeRequest(thisSwitch.INPUT_VALUE_POWER_OFF);
      } else if (switchValue == thisSwitch.INPUT_VALUE_POWER_25) {
        thisSwitch.simulation.addEvent('turnLight25ButtonClicked');
        thisSwitch.simulation
            .handleLightChangeRequest(thisSwitch.INPUT_VALUE_POWER_25);
      } else if (switchValue == thisSwitch.INPUT_VALUE_POWER_50) {
        thisSwitch.simulation.addEvent('turnLight50ButtonClicked');
        thisSwitch.simulation
            .handleLightChangeRequest(thisSwitch.INPUT_VALUE_POWER_50);
      } else if (switchValue == thisSwitch.INPUT_VALUE_POWER_75) {
        thisSwitch.simulation.addEvent('turnLight75ButtonClicked');
        thisSwitch.simulation
            .handleLightChangeRequest(thisSwitch.INPUT_VALUE_POWER_75);
      } else if (switchValue == thisSwitch.INPUT_VALUE_POWER_FULL) {
        thisSwitch.simulation.addEvent('turnLightFullButtonClicked');
        thisSwitch.simulation
            .handleLightChangeRequest(thisSwitch.INPUT_VALUE_POWER_FULL);
      }
    });
  }
}
