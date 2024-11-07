import * as $ from 'jquery';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';
import { eventBus } from './eventBus';

export abstract class ControlButton {
  protected button;

  constructor(protected simulation: PlantGlucoseSimulation, name: string) {
    this.button = $(`#${name}`);
    this.button.on('click', () => eventBus.emit(`${name}Clicked`));
  }
}
