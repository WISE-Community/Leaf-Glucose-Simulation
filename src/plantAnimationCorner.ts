import * as SVG from "svg.js";

/**
 * PlantAnimationCorner --- Displays the animation showing photons
 * hitting the plant.
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class PlantAnimationCorner {
    draw: SVG;
    lightBulbOn: SVG;
    lightBulbOff: SVG;
    allLeaves: SVG[];
    leafYellow: SVG;
    leafLightGreen: SVG;
    leafGreen: SVG;
    leafDead: SVG;
    darknessOverlay: SVG;

    /**
     * Instantiates variables with initial values for objects
     * within the plant animation corner.
     * @param draw An SVG draw object to paint other elements on
     */
    constructor(draw: SVG) {
        this.draw = draw;

        // draws the upper left box where the light and plant will be displayed
        this.draw.rect(250,300).x(0).y(0).fill('white').stroke({width:2});

        // create the leaf images
        this.leafYellow = this.draw.image('./leafYellow.png', 128, 128).attr({
            'x': 20,
            'y': 150
        });

        this.leafLightGreen = this.draw.image('./leafLightGreen.png', 128, 128).attr({
            'x': 55,
            'y': 90
        });

        this.leafGreen = this.draw.image('./leafGreen.png', 128, 128).attr({
            'x': 55,
            'y': 90
        });

        // draw the pot
        this.draw.image('./pot.png', 128, 128).attr({"x": 100, "y": 160});

        // the dead leaf should appear above the pot
        this.leafDead = this.draw.image('./leafDead.png', 128, 128).attr({
            'x': 20,
            'y': 150
        });

        // store all the leaf images in an array from liveliest -> dead
        this.allLeaves = [this.leafGreen, this.leafLightGreen, this.leafYellow, this.leafDead];

        // draw the rectangle below the pot
        this.draw.rect(250,40).x(0).y(270).fill('gray').stroke({width:2});

        // create the light bulb on image
        this.lightBulbOn = this.draw.image('./lightbulb20001.png', 40, 70).rotate(150);

        // create the light bulb off image
        this.lightBulbOff = this.draw.image('./lightbulb20002.png', 40, 70).rotate(150).hide();

        // create the darkness overlay that displays when the light is turned off
        this.darknessOverlay = this.draw.rect(250, 300).attr({
            'fill-opacity': 0,
            'fill': 'black'
        });

        // show the green healthy leaf at the beginning
        this.showLeaf(0);
    }

    /**
     * Change the leaf that is displayed based on the leaf index specified.
     * 0 = green, 1 = light green, 2 = yellow, 3 = brown
     * @param leafIndex which leaf should be shown
     */
    showLeaf(leafIndex: number) {
        // first hide all the leaves
        this.allLeaves.map((leaf) => { leaf.hide() });

        // then show the appropriate leaf
        this.allLeaves[leafIndex].show();
    }

    /**
     * Turn the light on or off
     * @param doTurnLightOn true iff the light should be turned on
     */
    turnLightOn(doTurnLightOn: boolean = true) {
        if (doTurnLightOn) {
          // hide the grey light bulb
          this.lightBulbOff.hide();

          // show the yellow light bulb
          this.lightBulbOn.show();

          // hide the darkness overlay
          this.darknessOverlay.animate().attr({
              'fill-opacity': '0'
          });
        } else {
          // hide the yellow bulb
          this.lightBulbOn.hide();

          // show the grey bulb
          this.lightBulbOff.show();

          // show the darkness overlay
          this.darknessOverlay.animate().attr({
              'fill-opacity': '0.3'
          });
        }
    }
}
