import * as $ from 'jquery';
import { eventBus } from './eventBus';

export abstract class ControlButton {
  protected button;

  constructor(name: string) {
    this.button = $(`#${name}`);
    this.button.on('click', () => eventBus.emit(`${name}Clicked`));
  }
}
