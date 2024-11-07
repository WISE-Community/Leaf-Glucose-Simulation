import * as $ from 'jquery';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';

export abstract class ControlButton {
  protected button;

  constructor(protected simulation: PlantGlucoseSimulation, selector: string) {
    this.button = $(selector);
    this.button.on('click', () => this.onClickListener());
  }

  protected abstract onClickListener(): void;
}
