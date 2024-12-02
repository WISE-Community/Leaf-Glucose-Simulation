import {
  BG_COLOR_LIGHT_0,
  BG_COLOR_LIGHT_100,
  BG_COLOR_LIGHT_25,
  BG_COLOR_LIGHT_50,
  BG_COLOR_LIGHT_75,
} from './constants';
import { eventBus } from './eventBus';
import * as SVG from 'svg.js';
type SVG = typeof SVG;

/**
 * DayDisplayCorner --- Displays what day it is currently in the simulaton and
 * the background color shows whether the light is on or off.
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class DayDisplayCorner {
  private backgroundRect: SVG.Rect;
  private dayText: SVG.Text;

  constructor(draw: SVG, showOrganelles: boolean) {
    const x = showOrganelles ? 32 : 138;
    const y = showOrganelles ? 0 : 20;
    this.backgroundRect = draw
      .rect(250, 110)
      .x(x)
      .y(y)
      .fill(BG_COLOR_LIGHT_100)
      .stroke({ width: 2 });
    this.dayText = draw
      .text('Day 1')
      .x(x + 25)
      .y(y)
      .font({ size: 64 });
    eventBus.on('dayChanged').subscribe((day) => this.updateDayText(day));
    eventBus
      .on('numPhotonsChanged')
      .subscribe((numPhotons) => this.updateDayColor(numPhotons));
  }

  private updateDayText(currentDay: number): void {
    this.dayText.text(`Day ${currentDay}`);
  }

  /**
   * Updates the background color of this day display corner based on
   * number of photons
   * @param numPhotons how many photons came in this day
   */
  private updateDayColor(numPhotons: number): void {
    if (numPhotons === 4) {
      this.backgroundRect.fill(BG_COLOR_LIGHT_100);
    } else if (numPhotons === 3) {
      this.backgroundRect.fill(BG_COLOR_LIGHT_75);
    } else if (numPhotons === 2) {
      this.backgroundRect.fill(BG_COLOR_LIGHT_50);
    } else if (numPhotons === 1) {
      this.backgroundRect.fill(BG_COLOR_LIGHT_25);
    } else if (numPhotons === 0) {
      this.backgroundRect.fill(BG_COLOR_LIGHT_0);
    }
  }
}
