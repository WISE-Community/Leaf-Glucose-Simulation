/**
 * DayDisplayCorner --- Displays what day it is currently in the simulaton and
 * the background color shows whether the light is on or off.
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class DayDisplayCorner {
    draw: SVG;  // the SVG draw object
    dayRect: SVG;  // rectangle surrounding the day display corner
    dayText: SVG;  // text showing what day it is
    dayColorLightOn: string;  // hex color string of background for light on state
    dayColorLightOff: string; // hex color string of background for light off state

    /**
     * Instantiates variables with initial values for objects
     * within the day display corner.
     * @param draw An SVG draw object to paint other elements on
     * @param dayColorLightOn A String containing the default background color of this
     * day display corner when the light is on
     * @param dayColorLightOff A String containing the default background color of this
     * day display corner when the light is off
     */
    constructor(draw: SVG, dayColorLightOn: string, dayColorLightOff: string) {
        this.draw = draw;
        this.dayColorLightOn = dayColorLightOn;
        this.dayColorLightOff = dayColorLightOff;

        // draw the upper left box where the light and plant will be displayed
        this.dayRect = this.draw.rect(250, 110)
            .x(750).y(0).fill(this.dayColorLightOn).stroke({width:2});

        // create the day message text
        this.dayText = this.draw.text('Day 1')
            .x(775).y(0).font({size: 64});
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
          this.dayRect.fill(this.dayColorLightOn);
        } else {
          this.dayRect.fill(this.dayColorLightOff);
        }
    }
}
