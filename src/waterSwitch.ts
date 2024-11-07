import * as $ from 'jquery';
import { LightSwitch } from './lightSwitch';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
import { eventBus } from './eventBus';

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
  constructor(protected simulation: PlantGlucoseSimulation) {
    super(simulation);
    this.handleWaterChangeRequest(this.simulation.numWaterThisCycle);
    eventBus
      .on('waterChanged')
      .subscribe((numWater) => this.handleWaterChangeRequest(numWater));
    eventBus.on('numWaterChanged').subscribe(() => this.hideWaitImage());
  }

  protected getSwitchControlsId(): string {
    return 'waterSwitch';
  }

  protected getSwitchInputId(): string {
    return 'waterSwitchInput';
  }

  protected setControls(): void {
    super.setControls();
    const waterLevelLabels = this.simulation.getSettings().waterLevelLabels;
    for (let i = 0; i < waterLevelLabels.length; i++) {
      $(`.waterLevelLabel${i}`).html(waterLevelLabels[i]);
    }
  }

  /**
   * Updates the amount of water coming in from water source
   *
   * If the request comes during an animation cycle, set a variable flag and
   * show a wait image so the user knows the change will take effect
   * at the beginning of the next animation cycle.
   *
   * @param numWaterNextCycle the new water count requested by the user.
   * Possible values are 0, 1
   */
  private handleWaterChangeRequest(numWaterNextCycle: number): void {
    if (this.simulation.isAnimationPlaying()) {
      this.showWaitImage();
      this.simulation.numWaterNextCycle = numWaterNextCycle;
    } else {
      // animation is stopped, so update the water setting now
      this.simulation.updateNumWaterThisCycle(numWaterNextCycle);
    }
  }

  listenForUserInput() {
    const thisSwitch = this;
    this.switchInput.on('change', function () {
      const switchValue = $(this).val();
      if (switchValue == thisSwitch.INPUT_VALUE_POWER_OFF) {
        thisSwitch.simulation.addEvent('turnWaterOffButtonClicked');
        thisSwitch.handleWaterChangeRequest(0);
      } else if (switchValue == thisSwitch.INPUT_VALUE_POWER_ON) {
        thisSwitch.simulation.addEvent('turnWaterOnButtonClicked');
        thisSwitch.handleWaterChangeRequest(4);
      }
    });
  }
}
