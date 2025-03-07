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
import { eventBus } from './eventBus';
import { PlantPhotons } from './plantPhotons';

/**
 * PlantAnimationCorner --- Displays the animation showing photons hitting the plant.
 * When the light is off, a darkness overlay is displayed
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class PlantAnimationCorner {
  private draw: SVG.Doc;
  private lightBulbOn: SVG.Image;
  private lightBulbOff: SVG.Image;
  private deadImg: SVG.Image;
  private unhealthyImg: SVG.Image;
  private moderateImg: SVG.Image;
  private healthyImg: SVG.Image;
  private veryHealthyImg: SVG.Image;
  private darknessOverlay: SVG.Rect;
  private wateringCan: SVG.Image;
  private showLightBulb: boolean = false;

  /**
   * Instantiates variables with initial values for objects
   * within the plant animation corner.
   * @param draw An SVG draw object to paint other elements on
   */
  constructor(private simulation: PlantGlucoseSimulation) {
    this.draw = SVG('plantAnimation');
    this.showLightBulb = simulation.getSettings().showLightBulb;
    const plantImgSrc = simulation.getSettings().plantImgSrc;

    this.draw.rect(500, 700).x(0).y(150).fill('white').stroke({ width: 2 });

    if (plantImgSrc) {
      this.setPlantImages(plantImgSrc);
    } else {
      const plantImages = new Array(5).fill('./images/leafGreen.png');
      this.setPlantImages(plantImages);
    }

    this.updateImg(this.simulation.getTotalGlucoseStored());

    this.darknessOverlay = this.draw.rect(500, 700).y(150).attr({
      'fill-opacity': 0.3,
      fill: BG_COLOR_LIGHT_100,
    });

    // draw the ground below the pot
    this.draw.rect(500, 40).x(0).y(810).fill('gray').stroke({ width: 2 });

    this.lightBulbOn = this.draw
      .image('./images/lightbulb20001.png', 100, 135)
      .y(150)
      .rotate(150)
      .hide();

    if (this.showLightBulb) {
      this.lightBulbOn.show();
    }

    this.lightBulbOff = this.draw
      .image('./images/lightbulb20002.png', 100, 135)
      .y(150)
      .rotate(150)
      .hide();

    // draw the watering can
    this.wateringCan = this.draw
      .image('./images/wateringcan.png', 186, 168)
      .attr({
        x: 275,
        y: 185,
      })
      .rotate(-40);
    if (!this.simulation.getSettings().showWater) {
      this.wateringCan.hide();
    }
    new PlantPhotons(this.simulation);
    eventBus
      .on('numPhotonsChanged')
      .subscribe((numPhotons: number) => this.updateBackground(numPhotons));
    eventBus
      .on('numWaterChanged')
      .subscribe((numWater: number) => this.updateWatering(numWater));
    eventBus
      .on('glucoseReset')
      .subscribe(() => this.updateImg(this.simulation.getTotalGlucoseStored()));
    eventBus
      .on('endOfDay')
      .subscribe(() => this.updateImg(this.simulation.getTotalGlucoseStored()));
  }

  /**
   * Updates the background color of this day display corner based on
   * number of photons
   * @param numPhotonsThisCycle how many photons came in this day
   */
  private updateBackground(numPhotonsThisCycle: number): void {
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
    if (this.showLightBulb) {
      this.lightBulbOn.hide();
      this.lightBulbOff.show();
    }
  }

  turnLightOn() {
    if (this.showLightBulb) {
      this.lightBulbOff.hide();
      this.lightBulbOn.show();
    }
  }

  /**
   * Updates the watering animation based on the water level
   * @param numWaterThisCycle how much water came in this day
   */
  private updateWatering(numWaterThisCycle: number): void {
    if (numWaterThisCycle > 0) {
      this.wateringCan.show();
    } else {
      this.wateringCan.hide();
    }
  }

  private setPlantImages(plantImages: string[]) {
    this.deadImg = this.drawMainImage(plantImages.at(0), 340, 0.6);
    this.unhealthyImg = this.drawMainImage(plantImages.at(1), 340, 0.7);
    this.moderateImg = this.drawMainImage(plantImages.at(2), 340, 0.8);
    this.healthyImg = this.drawMainImage(plantImages.at(3), 340, 0.9);
    this.veryHealthyImg = this.drawMainImage(plantImages.at(4), 340, 1);
  }

  private drawMainImage(img: string, y: number, opacity: number): any {
    return this.draw.image(img, 500, 500).attr({
      y: y,
      opacity: opacity,
    });
  }

  private updateImg(totalGlucoseStored: number) {
    this.hideAllPlantImg();
    this.showRelevantPlantImg(totalGlucoseStored);
  }

  private hideAllPlantImg() {
    this.deadImg.hide();
    this.unhealthyImg.hide();
    this.moderateImg.hide();
    this.healthyImg.hide();
    this.veryHealthyImg.hide();
  }

  private showRelevantPlantImg(totalGlucoseStored: number) {
    if (totalGlucoseStored === 0) {
      this.deadImg.show();
    } else if (totalGlucoseStored <= 4) {
      this.unhealthyImg.show();
    } else if (totalGlucoseStored <= 10) {
      this.moderateImg.show();
    } else if (totalGlucoseStored <= 15) {
      this.healthyImg.show();
    } else {
      this.veryHealthyImg.show();
    }
  }
}
