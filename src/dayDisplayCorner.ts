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
  lightOnHex: string;
  lightOffHex: string;

  /**
   * @param draw An SVG draw object to paint other elements on
   * @param lightOnHex A String containing the default background color of this
   * day display corner when the light is on
   * @param lightOffHex A String containing the default background color of this
   * day display corner when the light is off
   */
  constructor(draw: SVG, lightOnHex: string, lightOffHex: string) {
    this.draw = draw;
    this.lightOnHex = lightOnHex;
    this.lightOffHex = lightOffHex;

    this.backgroundRect = this.draw.rect(250, 110) .x(750).y(0)
        .fill(this.lightOnHex).stroke({width:2});

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
   * whether the light is on or off
   * @param isLightOn A boolean containing whether the light is on or off
   */
  updateDayColor(isLightOn: boolean) {
    if (isLightOn) {
      this.backgroundRect.fill(this.lightOnHex);
    } else {
      this.backgroundRect.fill(this.lightOffHex);
    }
  }
}
