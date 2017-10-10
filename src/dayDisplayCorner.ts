/**
 * DayDisplayCorner --- Displays what day it is currently in the simulaton and
 * the background color shows whether the light is on or off.
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class DayDisplayCorner {
  draw: SVG;
  backgroundRect: SVG;
  dayText: SVG;
  bgColorLight100: string;
  bgColorLight75: string;
  bgColorLight50: string;
  bgColorLight25: string;
  bgColorLight0: string;

  /**
   * @param draw An SVG draw object to paint other elements on
   * @param lightOnHex A String containing the default background color of this
   * day display corner when the light is on
   * @param lightOffHex A String containing the default background color of this
   * day display corner when the light is off
   */
  constructor(draw: SVG, bgColorLight100: string, bgColorLight75: string, bgColorLight50: string,
      bgColorLight25: string, bgColorLight0: string) {
    this.draw = draw;
    this.bgColorLight100 = bgColorLight100;
    this.bgColorLight75 = bgColorLight75;
    this.bgColorLight50 = bgColorLight50;
    this.bgColorLight25 = bgColorLight25;
    this.bgColorLight0 = bgColorLight0;

    this.backgroundRect = this.draw.rect(250, 110).x(750).y(0)
      .fill(this.bgColorLight100).stroke({width: 2});

    this.dayText = this.draw.text('Day 1').x(775).y(0).font({size: 64});
  }

  /**
   * Updates the current day indicator as specified
   * @param currentDayText A string containing the current day text
   */
  updateDayText(currentDayText: string) {
    this.dayText.text(currentDayText);
  }

  /**
   * Updates the background color of this day display corner based on
   * number of photons
   * @param numPhotonsThisCycle how many photons came in this day
   */
  updateDayColor(numPhotonsThisCycle: number) {
    if (numPhotonsThisCycle === 4) {
      this.backgroundRect.fill(this.bgColorLight100);
    } else if (numPhotonsThisCycle === 3) {
      this.backgroundRect.fill(this.bgColorLight75);
    } else if (numPhotonsThisCycle === 2) {
      this.backgroundRect.fill(this.bgColorLight50);
    } else if (numPhotonsThisCycle === 1) {
      this.backgroundRect.fill(this.bgColorLight25);
    } else if (numPhotonsThisCycle === 0) {
      this.backgroundRect.fill(this.bgColorLight0);
    }
  }
}
