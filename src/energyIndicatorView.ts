/**
 * EnergyIndicatorView --- object to display the energy indicator box
 * and its contents repair damage/transport nutrients energy remaining
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class EnergyIndicatorView {
    batteryImageRepairDamage: SVG;
    batteryImageTransportNutrients: SVG;
    border: SVG;
    draw: SVG;
    energyIndicatorBox: SVG;
    energyIndicatorText: SVG;
    greenCheck: SVG;
    redExclamation: SVG;
    redX: SVG;
    repairDamageRect: SVG;
    repairDamageIndicatorText: SVG;
    transportNutrientsRect: SVG;
    transportNutrientsIndicatorText: SVG;

    BATTERY_FULL_HEIGHT = 66;  // height of battery rectangle when full, in pixles.
    BATTERY_FULL_COLOR = "#82c940";  // color of battery rectangle when full
    BATTERY_HALF_FULL_COLOR = "#ffd700";  // color of battery rectangle when half full
    BATTERY_NEAR_EMPTY_COLOR = "#fc0d1b";  // color of battery rectangle when near empty
    DEFAULT_FONT_SIZE = 40;  // default font-size for text in this view
    INDICATOR_BATTERY_ORIGINAL_Y = 821; // where battery mask's y is

    /**
     * Instantiates elements in the energy indication view.
     * @param draw the SVG object where the view will be drawn on
     */
    constructor(draw: SVG) {
        this.draw = draw;

        // draw a border around the view
        this.border = this.draw.rect(900, 200).x(50).y(750)
            .fill('white').stroke({width:2}).opacity(1)
            .attr({
                'fill-opacity': 1
            });

        // draw the "Energy Needs" text and indication markers
        this.energyIndicatorText = this.draw.text('Energy\nNeeds')
            .x(100).y(760).font({size: this.DEFAULT_FONT_SIZE});

        this.greenCheck = this.draw.image('./green_check.png').attr({
            'x': 125,
            'y': 875
        });

        this.redExclamation = this.draw.image('./red_exclamation.png')
            .attr({
                'x': 125,
                'y': 875
            }).hide();

        this.redX = this.draw.image('./redX.png')
            .attr({
                'x': 125,
                'y': 875
            }).hide();

        // draw the "Repair Damage" text and battery remaining indication
        this.repairDamageRect = this.draw.rect(48, this.BATTERY_FULL_HEIGHT)
            .x(325).y(this.INDICATOR_BATTERY_ORIGINAL_Y).fill(this.BATTERY_FULL_COLOR);

        this.batteryImageRepairDamage = this.draw.image('./battery_empty.png')
            .attr({
                'x': 325,
                'y': 815
            });

        this.repairDamageIndicatorText = this.draw.text('Repair\nDamage')
            .x(385).y(795).font({size: 40});

        // draw the "Transport Nutrients" text and battery remaining indication
        this.transportNutrientsRect = this.draw.rect(48, this.BATTERY_FULL_HEIGHT)
            .x(625).y(this.INDICATOR_BATTERY_ORIGINAL_Y).fill(this.BATTERY_FULL_COLOR);

        this.batteryImageTransportNutrients = this.draw.image('./battery_empty.png')
            .attr({
                'x': 625,
                'y': 815
            });

        this.transportNutrientsIndicatorText = this.draw.text('Transport\nNutrients')
            .x(685).y(795).font({size: 40});

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
        let newBatteryHeight = this.BATTERY_FULL_HEIGHT * energyRemaining / 100;
        this.repairDamageRect.height(newBatteryHeight);
        this.transportNutrientsRect.height(newBatteryHeight);

        let newBatteryY = this.INDICATOR_BATTERY_ORIGINAL_Y + (this.BATTERY_FULL_HEIGHT - newBatteryHeight);
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
     * Shows status of energy needs.
     *   Green check mark if full of energy
     *   None if half energy
     *   Red exclamation mark if energy is needed
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
