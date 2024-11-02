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

  constructor(simulation: PlantGlucoseSimulation) {
    this.show = simulation.getSettings().enableInputControls;
    this.simulation = simulation;
    this.setControls();
    this.setLabels();
    if (this.show) {
      this.switchControls.show();
    }
    this.simulation.inputControlsEnabledEvent$.subscribe((enable: boolean) => {
      this.setEnableUserInput(enable);
    });
    this.simulation.lightChangedRequest$.subscribe((numPhotons: number) => {
      this.handleLightChangeRequest(numPhotons);
    });
    this.simulation.numPhotonsChangedEvent$.subscribe(() =>
      this.hideWaitImage()
    );
    this.simulation.resetEvent$.subscribe(() => this.hideWaitImage());
    this.listenForUserInput();
    this.handleLightChangeRequest(this.simulation.numPhotonsThisCycle);
  }

  setControls() {
    this.waitImage = $('#waitImage');
    this.switchControls = $('#lightSwitch');
    this.switchInput = $('#lightSwitchInput');
  }

  private setLabels(): void {
    const lightLevelLabels = this.simulation.getSettings().lightLevelLabels;
    for (let i = 0; i < lightLevelLabels.length; i++) {
      $(`.lightLevelLabel${i}`).html(lightLevelLabels[i]);
    }
  }

  listenForUserInput() {
    const thisSwitch = this;
    this.switchInput.on('change', function () {
      const switchValue = $(this).val();
      if (switchValue == thisSwitch.INPUT_VALUE_POWER_OFF) {
        thisSwitch.simulation.addEvent('turnLightOffButtonClicked');
        thisSwitch.handleLightChangeRequest(0);
      } else if (switchValue == thisSwitch.INPUT_VALUE_POWER_ON) {
        thisSwitch.simulation.addEvent('turnLightOnButtonClicked');
        thisSwitch.handleLightChangeRequest(4);
      }
    });
  }

  /**
   * Updates the number of photons coming in from light source
   *
   * If the request comes during an animation cycle, set a variable flag and
   * show a wait image so the user knows the change will take effect
   * at the beginning of the next animation cycle.
   *
   * @param numPhotonsNextCycle the new photon count requested by
   * the user. Possible values are 0, 1, 2, 3, or 4
   */
  protected handleLightChangeRequest(numPhotonsNextCycle: number): void {
    if (this.simulation.isAnimationPlaying()) {
      this.showWaitImage();
      this.simulation.numPhotonsNextCycle = numPhotonsNextCycle;
    } else {
      // animation is stopped, so update the light setting now
      this.simulation.updateNumPhotonsThisCycle(numPhotonsNextCycle);
    }
  }

  hideWaitImage() {
    this.waitImage.fadeOut();
  }

  protected showWaitImage() {
    if (this.show) {
      this.waitImage.show();
    }
  }

  private setEnableUserInput(enable: boolean) {
    if (enable) {
      this.switchControls.find('input').prop('disabled', false);
    } else {
      this.switchControls.find('input').prop('disabled', true);
    }
  }
}
