import * as SVG from 'svg.js';
type SVG = typeof SVG.Doc;
import {
  BG_COLOR_LIGHT_0,
  BG_COLOR_LIGHT_100,
  BG_COLOR_LIGHT_25,
  BG_COLOR_LIGHT_50,
  BG_COLOR_LIGHT_75,
} from './constants';
import { PlantGlucoseSimulation } from './plantGlucoseSimulation';

/**
 * PlantAnimationCorner --- Displays the animation showing photons hitting the plant.
 * When the light is off, a darkness overlay is displayed
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class PlantAnimationCorner {
  GREEN_LEAF_INDEX: number = 0;
  LIGHT_GREEN_LEAF_INDEX: number = 1;
  YELLOW_LEAF_INDEX: number = 2;
  DEAD_LEAF_INDEX: number = 3;

  draw: SVG.Doc;
  lightBulbOn: SVG.Image;
  lightBulbOff: SVG.Image;
  allLeaves: SVG.Image[];
  leafYellow: SVG.Image;
  leafLightGreen: SVG.Image;
  leafGreen: SVG.Image;
  leafDead: SVG.Image;
  darknessOverlay: SVG.Rect;
  wateringCan: SVG.Image;
  customPlant: SVG;

  /**
   * Instantiates variables with initial values for objects
   * within the plant animation corner.
   * @param draw An SVG draw object to paint other elements on
   */
  constructor(private simulation: PlantGlucoseSimulation) {
    this.draw = simulation.draw;
    const plantImgSrc = simulation.getSettings().plantImgSrc;

    // draw the outline in the upper-left corner
    this.draw.rect(300, 300).x(0).y(0).fill('white').stroke({ width: 2 });

    if (plantImgSrc) {
      this.leafGreen = this.draw.image(plantImgSrc, 280, 280).attr({
        x: 10,
        y: 50,
      });
      this.leafYellow = this.draw.image(plantImgSrc, 280, 280).attr({
        x: 10,
        y: 50,
        opacity: 0.6,
      });
      this.leafLightGreen = this.draw.image(plantImgSrc, 280, 280).attr({
        x: 10,
        y: 50,
        opacity: 0.8,
      });
      this.leafDead = this.draw.image(plantImgSrc, 280, 280).attr({
        x: 10,
        y: 50,
        opacity: 0.4,
      });
    } else {
      this.leafGreen = this.draw
        .image('./images/leafGreen.png', 128, 128)
        .attr({
          x: 55,
          y: 90,
        });
      this.leafYellow = this.draw
        .image('./images/leafYellow.png', 128, 128)
        .attr({
          x: 20,
          y: 150,
        });
      this.leafLightGreen = this.draw
        .image('./images/leafLightGreen.png', 128, 128)
        .attr({
          x: 55,
          y: 90,
        });
      this.draw.image('./images/pot.png', 128, 128).attr({ x: 100, y: 160 });
      this.leafDead = this.draw.image('./images/leafDead.png', 128, 128).attr({
        x: 20,
        y: 150,
      });
    }

    // store all the leaf images in an array from liveliest -> dead
    this.allLeaves = [
      this.leafGreen,
      this.leafLightGreen,
      this.leafYellow,
      this.leafDead,
    ];

    this.showGreenLeaf();

    // draw the ground below the pot
    this.draw.rect(300, 40).x(0).y(270).fill('gray').stroke({ width: 2 });

    this.lightBulbOn = this.draw
      .image('./images/lightbulb20001.png', 40, 70)
      .rotate(150);

    this.lightBulbOff = this.draw
      .image('./images/lightbulb20002.png', 40, 70)
      .rotate(150)
      .hide();

    this.darknessOverlay = this.draw.rect(300, 300).attr({
      'fill-opacity': 0.3,
      fill: BG_COLOR_LIGHT_100,
    });

    // draw the watering can
    this.wateringCan = this.draw
      .image('./images/wateringcan.png', 120, 101)
      .attr({
        x: 180,
        y: 8,
      })
      .rotate(-40);
    if (!this.simulation.getSettings().showWater) {
      this.wateringCan.hide();
    }
  }

  /**
   * Change the leaf that is displayed based on the leaf index specified.
   * 0 = green, 1 = light green, 2 = yellow, 3 = brown
   * @param leafIndex which leaf should be shown
   */
  showLeaf(leafIndex: number) {
    this.allLeaves.map((leaf) => {
      leaf.hide();
    });
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
   * Updates the background color of this day display corner based on
   * number of photons
   * @param numPhotonsThisCycle how many photons came in this day
   */
  updateBackground(numPhotonsThisCycle: number) {
    if (numPhotonsThisCycle === 4) {
      this.turnLightOn();
      this.darknessOverlay.fill(BG_COLOR_LIGHT_100);
    } else if (numPhotonsThisCycle === 3) {
      this.turnLightOn();
      this.darknessOverlay.fill(BG_COLOR_LIGHT_75);
    } else if (numPhotonsThisCycle === 2) {
      this.turnLightOn();
      this.darknessOverlay.fill(BG_COLOR_LIGHT_50);
    } else if (numPhotonsThisCycle === 1) {
      this.turnLightOn();
      this.darknessOverlay.fill(BG_COLOR_LIGHT_25);
    } else if (numPhotonsThisCycle === 0) {
      this.turnLightOff();
      this.darknessOverlay.fill(BG_COLOR_LIGHT_0);
    }
  }

  turnLightOff() {
    this.lightBulbOn.hide();
    this.lightBulbOff.show();
  }

  turnLightOn() {
    this.lightBulbOff.hide();
    this.lightBulbOn.show();
  }

  /**
   * Updates the watering animation based on the water level
   * @param numWaterThisCycle how much water came in this day
   */
  updateWatering(numWaterThisCycle: number) {
    if (numWaterThisCycle > 0) {
      this.turnWaterOn();
    } else {
      this.turnWaterOff();
    }
  }

  turnWaterOn() {
    this.wateringCan.show();
  }

  turnWaterOff() {
    this.wateringCan.hide();
  }
}
