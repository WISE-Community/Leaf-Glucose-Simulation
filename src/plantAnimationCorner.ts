import * as SVG from "svg.js";

/**
 * PlantAnimationCorner --- Displays the animation showing photons
 * hitting the plant.

 * When the light is off, a darkness overlay is displayed

 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class PlantAnimationCorner {
  GREEN_LEAF_INDEX: number = 0;
  LIGHT_GREEN_LEAF_INDEX: number = 1;
  YELLOW_LEAF_INDEX: number = 2;
  DEAD_LEAF_INDEX: number = 3;

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

    // draw the outline in the upper-left corner
    this.draw.rect(250,300).x(0).y(0).fill('white').stroke({width:2});

    this.leafYellow = this.draw.image('./leafYellow.png', 128, 128).attr({
      'x': 20,
      'y': 150
    });

    this.leafLightGreen = this.draw.image('./leafLightGreen.png', 128, 128)
      .attr({
        'x': 55,
        'y': 90
      });

    this.leafGreen = this.draw.image('./leafGreen.png', 128, 128).attr({
      'x': 55,
      'y': 90
    });

    this.draw.image('./pot.png', 128, 128).attr({"x": 100, "y": 160});

    // the dead leaf should appear above the pot
    this.leafDead = this.draw.image('./leafDead.png', 128, 128).attr({
      'x': 20,
      'y': 150
    });

    // store all the leaf images in an array from liveliest -> dead
    this.allLeaves = [this.leafGreen, this.leafLightGreen,
        this.leafYellow, this.leafDead];

    // draw the ground below the pot
    this.draw.rect(250,40).x(0).y(270).fill('gray').stroke({width:2});

    this.lightBulbOn = this.draw.image('./lightbulb20001.png', 40, 70)
        .rotate(150);

    this.lightBulbOff = this.draw.image('./lightbulb20002.png', 40, 70)
        .rotate(150).hide();

    this.darknessOverlay = this.draw.rect(250, 300).attr({
      'fill-opacity': 0,
      'fill': 'black'
    });

    this.showGreenLeaf();
  }

  /**
   * Change the leaf that is displayed based on the leaf index specified.
   * 0 = green, 1 = light green, 2 = yellow, 3 = brown
   * @param leafIndex which leaf should be shown
   */
  showLeaf(leafIndex: number) {
    this.allLeaves.map((leaf) => { leaf.hide() });
    this.allLeaves[leafIndex].show();
  }

  showGreenLeaf() {
    this.showLeaf(this.GREEN_LEAF_INDEX);
  }

  showLightGreenLeaf() {
    this.showLeaf(this.LIGHT_GREEN_LEAF_INDEX);
  }

  showYellowLeaf() {
    this.showLeaf(this.YELLOW_LEAF_INDEX);
  }

  showDeadLeaf() {
    this.showLeaf(this.DEAD_LEAF_INDEX);
  }

  /**
   * Turn the light on or off and display/hide darkness overlay
   * @param doTurnLightOn true iff the light should be turned on
   */
  turnLightOn(doTurnLightOn: boolean = true) {
    if (doTurnLightOn) {
      this.lightBulbOff.hide();
      this.lightBulbOn.show();
      this.hideDarknessOverlay();
    } else {
      this.lightBulbOn.hide();
      this.lightBulbOff.show();
      this.showDarknessOverlay();
    }
  }

  hideDarknessOverlay() {
    this.darknessOverlay.animate().attr({'fill-opacity': '0'});
  }

  showDarknessOverlay() {
    this.darknessOverlay.animate().attr({'fill-opacity': '0.3'});
  }
}
