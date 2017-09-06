export class EnergyIndicatorView {
    batteryEmptyRepairDamage: any;
    batteryEmptyTransportNutrients: any;
    draw: any;
    energyIndicatorBox: any;
    energyIndicatorText: any;
    greenCheck: any;
    INDICATOR_BATTERY_ORIGINAL_Y = 821;
    redExclamation: any;
    redX: any;
    repairDamageRect: any;
    repairDamageIndicatorText: any;
    transportNutrientsRect: any;
    transportNutrientsIndicatorText: any;

    BATTERY_FULL_HEIGHT = 66;  // height of battery rectangle when full, in pixles.
    BATTERY_FULL_COLOR = "#82c940";  // color of battery rectangle when full
    BATTERY_HALF_FULL_COLOR = "#ffd700";  // color of battery rectangle when half full
    BATTERY_NEAR_EMPTY_COLOR = "#fc0d1b";  // color of battery rectangle when near empty

    constructor(draw: any) {
        this.draw = draw;

        // create the message rectangle
        this.energyIndicatorBox = this.draw.rect(900, 200).x(50).y(750).fill('white').stroke({width:2}).opacity(1).attr({
            'fill-opacity': 1
        });

        this.energyIndicatorText = this.draw.text('Energy\nNeeds').x(100).y(760).font({size: 40});

        this.greenCheck = this.draw.image('./green_check.png').attr({
            'x': 125,
            'y': 875
        });

        this.redExclamation = this.draw.image('./red_exclamation.png').attr({
            'x': 125,
            'y': 875
        }).hide();

        this.redX = this.draw.image('./redX.png').attr({
            'x': 125,
            'y': 875
        }).hide();

        this.repairDamageRect = this.draw.rect(48, this.BATTERY_FULL_HEIGHT).x(325).y(this.INDICATOR_BATTERY_ORIGINAL_Y).fill(this.BATTERY_FULL_COLOR);

        this.batteryEmptyRepairDamage = this.draw.image('./battery_empty.png').attr({
            'x': 325,
            'y': 815
        });

        this.repairDamageIndicatorText = this.draw.text('Repair\nDamage').x(385).y(795).font({size: 40});

        this.transportNutrientsRect = this.draw.rect(48, this.BATTERY_FULL_HEIGHT).x(625).y(this.INDICATOR_BATTERY_ORIGINAL_Y).fill(this.BATTERY_FULL_COLOR);

        this.batteryEmptyTransportNutrients = this.draw.image('./battery_empty.png').attr({
            'x': 625,
            'y': 815
        });

        // create the message text
        this.transportNutrientsIndicatorText = this.draw.text('Transport\nNutrients').x(685).y(795).font({size: 40});

        // start with 100% energy
        this.showEnergyNeeds(100);
        this.showBatteryIndicator(100);
    }

    /**
     * Show the energy left in the battery, given the energyRemaining parameter.
     * 100 -> 50: green
     * 50 -> 25: yellow
     * 25 -> 0: red
     * @param energyRemaining an integer between 0 and 100
     */
    showBatteryIndicator(energyRemaining: number) {
        if (energyRemaining < 0) {
            return;
        }
        var newBatteryHeight = this.BATTERY_FULL_HEIGHT * energyRemaining / 100;
        this.repairDamageRect.height(newBatteryHeight);
        this.transportNutrientsRect.height(newBatteryHeight);

        var newBatteryY = this.INDICATOR_BATTERY_ORIGINAL_Y + (this.BATTERY_FULL_HEIGHT - newBatteryHeight);
        this.repairDamageRect.y(newBatteryY);
        this.transportNutrientsRect.y(newBatteryY);

        if (energyRemaining <= 25) {
          this.repairDamageRect.fill(this.BATTERY_NEAR_EMPTY_COLOR);
          this.transportNutrientsRect.fill(this.BATTERY_NEAR_EMPTY_COLOR);
        } else if (energyRemaining <= 50) {
          this.repairDamageRect.fill(this.BATTERY_HALF_FULL_COLOR);
          this.transportNutrientsRect.fill(this.BATTERY_HALF_FULL_COLOR);
        } else {
          this.repairDamageRect.fill(this.BATTERY_FULL_COLOR);
          this.transportNutrientsRect.fill(this.BATTERY_FULL_COLOR);
        }
    }

    /**
     * Shows green check mark if full of energy, none if half energy, red exclamation mark if energy is needed.
     * @param energyLeft an integer between 0 and 100
     */
    showEnergyNeeds(energyLeft: number) {
        this.greenCheck.hide();
        this.redExclamation.hide();
        this.redX.hide();
        if (energyLeft == 0) {
            this.redX.show();
        } else if (energyLeft <= 25) {
            this.redExclamation.show();
        } else if (energyLeft > 50) {
            this.greenCheck.show();
        }
    }
}
