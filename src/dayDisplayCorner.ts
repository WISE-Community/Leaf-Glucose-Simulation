export class DayDisplayCorner {
    draw: any;
    dayRect: any;
    dayText: any;
    dayColorLightOn: string;
    dayColorLightOff: string;

    constructor(draw: any, dayColorLightOn: string, dayColorLightOff: string) {
        this.draw = draw;
        this.dayColorLightOn = dayColorLightOn;
        this.dayColorLightOff = dayColorLightOff;

        // draws the upper left box where the light and plant will be displayed
        this.dayRect = this.draw.rect(250, 110).x(750).y(0).fill(this.dayColorLightOn).stroke({width:2});

        // create the day message text
        this.dayText = this.draw.text('Day 1').x(775).y(0).font({size: 64});
    }

    updateDayText(text: string) {
        this.dayText.text(text);
    }

    updateDayColor(isLightOn: boolean) {
        if (isLightOn) {
          this.dayRect.fill(this.dayColorLightOn);
        } else {
          this.dayRect.fill(this.dayColorLightOff);          
        }
    }
}
