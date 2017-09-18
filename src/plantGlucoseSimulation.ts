import { DayDisplayCorner } from './dayDisplayCorner';
import { EnergyIndicatorView } from './energyIndicatorView';
import { Event } from './event';
import { Feedback } from './feedback';
import { Graph } from './graph';
import { LightSwitch2 } from './lightSwitch2';
import { LightSwitch3 } from './lightSwitch3';
import { PlantAnimationCorner } from './plantAnimationCorner';
import { PlayBackControl } from './playBackControl';
import { SimulationEndFeedback } from './simulationEndFeedback';
import { SimulationSpeedSwitch } from './simulationSpeedSwitch';
import { SimulationState } from './simulationState';
import * as SVG from 'svg.js';
import 'svg.draggable.js';
import * as $ from 'jquery';

/**
 * PlantGlucoseSimulation --- Simulation showing the inside of a plant
 * during Photosynthesis.
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
export class PlantGlucoseSimulation {
  BATTERY_EMPTY_REPAIR_DAMAGE_X: number = 325;
  BATTERY_EMPTY_REPAIR_DAMAGE_Y: number = 815;
  BATTERY_EMPTY_TRANSPORT_NUTRIENTS_X: number = 625;
  BATTERY_EMPTY_TRANSPORT_NUTRIENTS_Y: number = 815;
  CHLOROPLAST_X = 450;
  CHLOROPLAST_Y = 100;

  // default amount of time (in ms) each animation should take to complete
  DEFAULT_ANIMATION_DURATION: number = 750;

  // default delay before staring animation in ms
  DEFAULT_ANIMATION_DELAY: number = 250;

  // scale for growing/shrinking glucose
  GLUCOSE_GROWTH_SCALE: number = 1.25;
  LIGHT_ON_GRAPH_REGION_COLOR: string = '#fff9a5';
  LIGHT_OFF_GRAPH_REGION_COLOR: string = '#dddddd';

  MAX_DAYS = 20;
  MITOCHONDRION_X = 500;
  MITOCHONDRION_Y = 400;
  STORAGE_X = 50;
  STORAGE_Y = 375;

  // ratio speed for each animation to complete. 0 = stop -> 1 = full speed
  animationSpeedRatio: number = 1;
  // actual amount of time (in ms) each animation should take to complete
  animationDuration: number =
      this.DEFAULT_ANIMATION_DURATION * this.animationSpeedRatio;

  chloroplast: SVG;
  currentAnimation: SVG;
  currentDayNumber: number = 0;
  currentTrialData: any;
  draw: SVG;
  dayDisplayCorner: DayDisplayCorner;
  energyIndicatorView: EnergyIndicatorView;
  energyLeft: number = 100;
  feedback: Feedback;
  graph: Graph;
  glucoseCreatedData: any[] = [];
  glucoseUsedData: any[] = [];
  glucoseStoredData: any[] = [];

  // the amount of glucose to add/subtract each day
  glucoseCreatedIncrement: number = 4;
  glucoseUsedIncrement: number = 2;

  glucose1: SVG;
  glucose2: SVG;
  glucose3: SVG;
  glucose4: SVG;
  glucosesInStorage: SVG[] = [];
  initialGlucoseCreated: number = 0;
  initialGlucoseUsed: number = 0;
  initialGlucoseStored: number = 0;
  isControlEnabled = true;
  isLightOn: boolean = true;
  isLightOnRequestedInNextCycle: boolean = false;
  isLightOffRequestedInNextCycle: boolean = false;
  lightEnergyPercent: number = 100;
  lightMode: number = 2;
  lightSwitch: any;
  mitochondrion: SVG;
  mitochondrionBattery1: SVG;
  mitochondrionBattery1_startingX = this.MITOCHONDRION_X + 100;
  mitochondrionBattery1_startingY = this.MITOCHONDRION_Y + 100;
  mitochondrionBattery2_startingX = this.MITOCHONDRION_X + 175;
  mitochondrionBattery2_startingY = this.MITOCHONDRION_Y + 50;
  mitochondrionBattery2: SVG;
  photonChloroplast1: SVG;
  photonChloroplast2: SVG;
  photonChloroplast3: SVG;
  photonChloroplast4: SVG;
  photonPlant1: SVG;
  photonPlant2: SVG;
  photonPlant3: SVG;
  photonPlant4: SVG;
  photonsGroup: SVG;
  plantAnimationCorner: PlantAnimationCorner;
  playBackControl: PlayBackControl;
  simulationEndFeedback: SimulationEndFeedback;
  simulationSpeedSwitch: SimulationSpeedSwitch;
  simulationState: SimulationState = SimulationState.Stopped;
  storage: SVG;

  // the current total amount of glucose created/used/stored
  totalGlucoseCreated = this.initialGlucoseCreated;
  totalGlucoseUsed = this.initialGlucoseUsed;
  totalGlucoseStored = this.initialGlucoseStored;

  // an array of trial data objects including the current trial
  trials: any[] = [];

  /**
   * Instantiates variables with initial values for objects
   * within the simulation.
   * @param elementId A string containing the id of the DOM element where
   * the simulation should be displayed
   * @param lightMode A number containing the number of options for light.
   * 2 = On/Off, 3 = Full/Half/Off
   * @param feedbackPolicy A string containing the identifier of the feedback
   * to use.
   * @param showGraph A boolean whether the graph should be displayed or not
   */
  constructor(elementId: string, lightMode: number = 2,
      feedbackPolicy: any = null, showGraph: boolean = true) {
    this.draw = SVG(elementId);
    this.lightMode = lightMode;
    if (this.lightMode === 2) {
      this.lightSwitch = new LightSwitch2(this);
      this.glucoseCreatedIncrement = 4;
      this.glucoseUsedIncrement = 2;
    } else if (this.lightMode === 3) {
      this.lightSwitch = new LightSwitch3(this);
    }
    this.simulationSpeedSwitch = new SimulationSpeedSwitch(this);
    this.playBackControl = new PlayBackControl(this);
    this.plantAnimationCorner = new PlantAnimationCorner(this.draw);
    this.dayDisplayCorner = new DayDisplayCorner(this.draw,
      this.LIGHT_ON_GRAPH_REGION_COLOR, this.LIGHT_OFF_GRAPH_REGION_COLOR);
    this.simulationEndFeedback = new SimulationEndFeedback(this.draw);
    this.energyIndicatorView = new EnergyIndicatorView(this.draw);
    this.graph = new Graph(this,this.LIGHT_ON_GRAPH_REGION_COLOR,
      this.LIGHT_OFF_GRAPH_REGION_COLOR, showGraph);
    this.feedback = new Feedback(this.draw, feedbackPolicy);
    this.chloroplast = this.draw.image('./chloroplast.png').attr({
      'x': this.CHLOROPLAST_X,
      'y': this.CHLOROPLAST_Y
    });
    this.mitochondrion = this.draw.image('./mitochondrion.png').attr({
      'x': this.MITOCHONDRION_X,
      'y': this.MITOCHONDRION_Y
    });
    this.storage = this.draw.image('./storage.png').attr({
      'x': this.STORAGE_X,
      'y': this.STORAGE_Y
    });
    this.startNewTrial();
  }

  startSimulation() {
    this.simulationState = SimulationState.Running;
    this.playAnimationCycle();
  }

  resumeSimulation() {
    this.simulationState = SimulationState.Running;
    this.currentAnimation.play();
  }

  isSimulationStopped() : boolean {
    return this.simulationState === SimulationState.Stopped;
  }

  isSimulationPaused() : boolean {
    return this.simulationState === SimulationState.Paused;
  }

  isSimulationRunning() : boolean {
    return this.simulationState === SimulationState.Running;
  }

  /**
   * Initialize and adds a new trial to all trials array
   */
  startNewTrial() {
    this.currentTrialData = {
      glucoseCreatedData: [[0, this.initialGlucoseCreated]],
      glucoseUsedData: [[0, this.initialGlucoseUsed]],
      glucoseStoredData: [[0, this.initialGlucoseStored]],
      events: []
    };
    this.trials.push(this.currentTrialData);
    console.log(this.trials);
  }

  /**
   * Update the glucose values
   * @param dayNumber which day to update values for
   * @param glucoseCreated whether glucose was created
   * @param glucoseUsed whether glucose was used
   */
  updateGlucoseValues(dayNumber: number, glucoseCreated: boolean,
      glucoseUsed: boolean) {
    if (glucoseCreated) {
      this.totalGlucoseCreated += this.glucoseCreatedIncrement;
    }
    if (glucoseUsed) {
      this.totalGlucoseUsed += this.glucoseUsedIncrement;
    }
    this.totalGlucoseStored = this.totalGlucoseCreated - this.totalGlucoseUsed;
    this.currentTrialData.glucoseCreatedData.push([dayNumber, this.totalGlucoseCreated]);
    this.currentTrialData.glucoseUsedData.push([dayNumber, this.totalGlucoseUsed]);
    this.currentTrialData.glucoseStoredData.push([dayNumber, this.totalGlucoseStored]);
  }

  /**
   * Run the plant animation cycle once.
   *
   * A cycle is one complete cycle, either with light on or off.
   *
   * The light can be switched on/off during the cycle, but it will not take
   * effect until the next cycle
   */
  playAnimationCycle() {
    this.currentDayNumber++; // start a new day
    if (this.currentDayNumber > this.MAX_DAYS) {
      this.handleSimulationEnded();
    } else { // the simulation has not reached the end yet
      this.dayDisplayCorner.updateDayText('Day ' + this.currentDayNumber);

      if (this.isLightOnRequestedInNextCycle) {
        this.isLightOn = true;
      } else if (this.isLightOffRequestedInNextCycle) {
        this.isLightOn = false;
      } else {
        // keep the isLightOn the same as before
      }

      // reset the light on/off request
      this.isLightOnRequestedInNextCycle = false;
      this.isLightOffRequestedInNextCycle = false;

      if (this.isLightOn) {
        this.turnLightOn();
        this.startLightOnAnimation(this.lightOnAnimationCallback.bind(this));
      } else {
        this.turnLightOff();
        this.startLightOffAnimation(this.lightOffAnimationCallback.bind(this));
      }
    }
  }

  lightOnAnimationCallback() {
    const isGlucoseCreated = true;
    const isGlucoseUsed = true;
    this.updateGlucoseValues(this.currentDayNumber, isGlucoseCreated,
        isGlucoseUsed);
    this.graph.updateGraph(this.currentTrialData, this.currentDayNumber,
        isGlucoseCreated);
    this.loopAnimationAfterBriefPause();
  }

  lightOffAnimationCallback() {
    this.graph.updateGraph(this.currentTrialData, this.currentDayNumber,
        false /* isGlucoseCreated */);
    this.loopAnimationAfterBriefPause();
  }

  loopAnimationAfterBriefPause() {
    window.setTimeout(() => {
      this.playAnimationCycle();
    }, this.animationDuration);
  }

  /**
   * Start the animation in a state where light is on
   */
  startLightOnAnimation(animationCallback: () => {}) {
    const sim: PlantGlucoseSimulation = this;
    this.photonsGroup = this.createPhotons();
    this.currentAnimation = this.photonsGroup;
    this.photonsGroup.animate({'duration': this.animationDuration})
        .move(50, 50)
        .during((pos, morph, eased, situation) => {
          this.drainEnergy(100 /* start */, 75 /* end */, pos);
        })
        .animate({'duration': this.animationDuration})
        .attr({'opacity': 0})
        .during((pos, morph, eased, situation) => {
          this.drainEnergy(75 /* start */, 50 /* end */, pos);
        })
        .afterAll(() => {
          this.moveGlucoseFromChloroplastToMitochondrion(animationCallback);
        });
  }

  // called during light ON cycle
  moveGlucoseFromChloroplastToMitochondrion(animationCallback: () => {}) {
    this.currentAnimation = this.createGlucose().animate(
        {'delay': this.DEFAULT_ANIMATION_DELAY * this.animationSpeedRatio,
        'duration': this.animationDuration})
        .dmove(20, 350)
        .during((pos, morph, eased, situation) => {
          this.drainEnergy(50 /* start */, 35 /* end */, pos);
        })
        .animate({'duration': this.animationDuration}).attr({'opacity': 0})
        .during((pos, morph, eased, situation) => {
          this.drainEnergy(35 /* start */, 20 /* end */, pos);
        })
        .afterAll(() => {
          this.moveGlucoseFromMitochondrionToEnergyIndicator(animationCallback);
        });
  }

  /**
   * Update EnergyLeft to a value between from and to, based on the ratio.
   * @param from A number between 0 -> 100 starting max
   * @param to A number between 0 -> 100 ending min
   * @param ratio A number between 0 -> 1 ratio between from and to that
   * should be the new energyLeft
   */
  drainEnergy(from: number, to: number, ratio: number) {
    this.energyLeft = from - ((from - to) * ratio);
    this.energyIndicatorView.updateEnergyDisplay(this.energyLeft);
  }

  createPhotons() {
    this.photonPlant1 = this.draw.image('./photon.png', 30, 30).attr({
      'x': 60,
      'y': 50
    });
    this.photonPlant2 = this.draw.image('./photon.png', 30, 30).attr({
      'x': 80,
      'y': 20
    });
    this.photonChloroplast1 = this.draw.image('./photon.png', 50, 50).attr({
      'x': 530,
      'y': 60
    });
    this.photonChloroplast2 = this.draw.image('./photon.png', 50, 50).attr({
      'x': 570,
      'y': 30
    });
    const photonsGroup = this.draw.group()
        .add(this.photonPlant1).add(this.photonPlant2)
        .add(this.photonChloroplast1).add(this.photonChloroplast2);

    if (this.glucoseCreatedIncrement === 4) {
      this.photonPlant3 = this.draw.image('./photon.png', 30, 30).attr({
        'x': 30,
        'y': 50
      });
      this.photonPlant4 = this.draw.image('./photon.png', 30, 30).attr({
        'x': 50,
        'y': 20
      });
      this.photonChloroplast3 = this.draw.image('./photon.png', 50, 50).attr({
        'x': 430,
        'y': 60
      });
      this.photonChloroplast4 = this.draw.image('./photon.png', 50, 50).attr({
        'x': 470,
        'y': 30
      });
      photonsGroup.add(this.photonPlant3).add(this.photonPlant4)
          .add(this.photonChloroplast3).add(this.photonChloroplast4);
    }
    return photonsGroup;
  }

  /**
   * Create glucose and returns a group containing them
   */
  createGlucose() {
    this.glucose3 = this.draw.image('./glucose.png', 70, 70).attr({
      'x': 600,
      'y': 150
    });
    this.glucose4 = this.draw.image('./glucose.png', 70, 70).attr({
      'x': 675,
      'y': 100
    });

    if (this.glucoseCreatedIncrement === 4) {
      this.glucose1 = this.draw.image('./glucose.png', 70, 70).attr({
        'x': 450,
        'y': 100
      });
      this.glucose2 = this.draw.image('./glucose.png', 70, 70).attr({
        'x': 525,
        'y': 150
      });
    }
    return this.draw.group().add(this.glucose3).add(this.glucose4);
  }

  // called during light ON cycle
  moveGlucoseFromChloroplastToStorage(animationCallback: () => {}) {
    if (this.glucoseCreatedIncrement === 4) {
      this.currentAnimation = this.draw.set()
          .add(this.glucose1).add(this.glucose2);

      // move the glucose to storage in rows
      this.glucose1.animate(
          {'delay': this.DEFAULT_ANIMATION_DELAY * this.animationSpeedRatio,
          'duration': this.animationDuration})
          .move(this.STORAGE_X + ((this.glucosesInStorage.length / 2) % 5) * 75,
              this.STORAGE_Y +
              (Math.floor((this.glucosesInStorage.length / 2) / 5)) * 75)
          .afterAll(() => {
            this.shrinkGlucoseInStorage(animationCallback);
          });

      this.glucose2.animate(
          {'delay': this.DEFAULT_ANIMATION_DELAY * this.animationSpeedRatio,
          'duration': this.animationDuration})
          .move(this.STORAGE_X + ((this.glucosesInStorage.length / 2) % 5) * 75,
              this.STORAGE_Y +
              (Math.floor((this.glucosesInStorage.length / 2) / 5)) * 75);
    } else {
      // there is no glucose to move to storage, so
      // go directly to the callback
      animationCallback();
    }
  }

  /**
   * Shrinks glucose that was just moved from mitochondrion to storage
   */
  shrinkGlucoseInStorage(animationCallback: () => {}) {
    const glucose1InStorage = this.glucose1.clone();
    const glucose2InStorage = this.glucose2.clone();
    this.glucosesInStorage.push(glucose1InStorage, glucose2InStorage);

    glucose1InStorage.width(this.glucose1.width() / this.GLUCOSE_GROWTH_SCALE)
        .height(this.glucose1.height() / this.GLUCOSE_GROWTH_SCALE)
        .dx(25).dy(-25);

    glucose2InStorage.width(this.glucose1.width() / this.GLUCOSE_GROWTH_SCALE)
        .height(this.glucose1.height() / this.GLUCOSE_GROWTH_SCALE)
        .dx(-25).dy(25);
    this.glucose1.hide();
    this.glucose2.hide();

    animationCallback();
  }

  /**
   * Move the glucose to center of mitochondrion during light OFF cycle
   * @param lastTwoGlucoses An array of last two glucoses in storage
   * @param animationCallback A callback of animation
   */
  moveGlucoseFromStorageToMitochondrion(lastTwoGlucoses: any[],
      animationCallback: () => {}) {
    const [glucose1InStorage, glucose2InStorage] = lastTwoGlucoses;

    this.currentAnimation = this.draw.set()
        .add(glucose1InStorage).add(glucose2InStorage);;

    glucose1InStorage.animate({'duration': this.animationDuration})
        .move(this.mitochondrionBattery1_startingX,
            this.mitochondrionBattery1_startingY)
        .during((pos, morph, eased, situation) => {
          this.drainEnergy(100 /* start */, 75 /* end */, pos);
        })
        .animate({'duration': this.animationDuration}).opacity(0)
        .during((pos, morph, eased, situation) => {
          this.drainEnergy(75 /* start */, 50 /* end */, pos);
        })
        .afterAll(() => {
          // remove the last two glucose from storage
          this.glucosesInStorage.splice(this.glucosesInStorage.length - 2, 2);
          this.moveGlucoseFromMitochondrionToEnergyIndicator(animationCallback);
        });
    glucose2InStorage.animate({'duration': this.animationDuration})
        .move(this.mitochondrionBattery2_startingX,
            this.mitochondrionBattery1_startingY)
        .animate({'duration': this.animationDuration}).opacity(0)
  }

  // called during both light ON and OFF cycle
  moveGlucoseFromMitochondrionToEnergyIndicator(animationCallback: () => {}) {
    this.currentAnimation = this.createMitochondrionBatteries();

    // move mitochondrion battery 1 to repair damage
    this.mitochondrionBattery1.animate(
        {'delay': this.DEFAULT_ANIMATION_DELAY * this.animationSpeedRatio,
        'duration': this.animationDuration})
        .move(this.BATTERY_EMPTY_REPAIR_DAMAGE_X,
            this.BATTERY_EMPTY_REPAIR_DAMAGE_Y)
        .during((pos, morph, eased, situation) => {
          if (this.isLightOn) {
            this.drainEnergy(20 /* start */, 5 /* end */, pos);
          } else {
            this.drainEnergy(50 /* start */, 5 /* end */, pos);
          }
        })
        .afterAll(() => {
          if (this.isLightOn) {
            this.resetEnergyToFull();
            this.removeMitochondrionBatteries();
            this.moveGlucoseFromChloroplastToStorage(animationCallback);
          } else {
            this.playLightOffFinalAnimationSequence(animationCallback);
          }
        });

    // movebattery 2 to transport nutrients
    this.mitochondrionBattery2.animate(
        {'delay': this.DEFAULT_ANIMATION_DELAY * this.animationSpeedRatio,
        'duration': this.animationDuration})
        .move(this.BATTERY_EMPTY_TRANSPORT_NUTRIENTS_X,
            this.BATTERY_EMPTY_TRANSPORT_NUTRIENTS_Y);
  }

  resetEnergyToFull() {
    this.energyLeft = 100;
    this.energyIndicatorView.updateEnergyDisplay(this.energyLeft);
  }

  /**
   * Last sequence in the light off cycle
   */
  playLightOffFinalAnimationSequence(animationCallback: () => {}) {
    this.resetEnergyToFull();
    this.removeMitochondrionBatteries();

    const glucoseCreated = false;
    const glucoseUsed = true;
    this.updateGlucoseValues(this.currentDayNumber, glucoseCreated, glucoseUsed);
    animationCallback();
  }

  /**
   * Increases the size of last two glucoses in storage by the
   * GLUCOSE_GROWTH_SCALE factor
   * @returns {[SVG,SVG]} An array of last two glucoses in storage after
   * growing it in size
   */
  increaseLastTwoGlucoseSizes() {
    const glucose1InStorageIndex = this.glucosesInStorage.length - 1;
    const glucose1InStorage = this.glucosesInStorage[glucose1InStorageIndex];
    glucose1InStorage.width(glucose1InStorage.width() * this.GLUCOSE_GROWTH_SCALE)
        .height(glucose1InStorage.height() * this.GLUCOSE_GROWTH_SCALE);

    const glucose2InStorageIndex = this.glucosesInStorage.length - 2;
    const glucose2InStorage = this.glucosesInStorage[glucose2InStorageIndex];
    glucose2InStorage.width(glucose2InStorage.width() * this.GLUCOSE_GROWTH_SCALE)
        .height(glucose2InStorage.height() * this.GLUCOSE_GROWTH_SCALE);
    return [glucose1InStorage, glucose2InStorage];
  }

  handleSimulationEnded() {
    this.addEvent('simulationEnded');
    this.pauseSimulation();
    this.simulationEndFeedback.showSimulationEnded();
    this.disableControlButtons();
  }

  /**
   * Start the animation in a state where light is off
   */
  startLightOffAnimation(animationCallback: () => {}) {
    if (this.glucosesInStorage.length > 0) {
      const lastTwoGlucoses = this.increaseLastTwoGlucoseSizes();
      this.moveGlucoseFromStorageToMitochondrion(lastTwoGlucoses, animationCallback);
    } else {
      // there's no glucose stored in storage, and the light is off
      // so it's the last cycle before death
      if (this.energyLeft > 0) {
        this.currentAnimation = this.draw.animate(
            {'duration': this.animationDuration * 3})
            .during((pos, morph, eased, situation) => {
              this.drainEnergy(100 /* start */, 0 /* end */, pos);
            })
            .afterAll(() => {
              this.disableControlButtons();
              this.startPlantDeathSequence();
            });
      }
    }
  }

  startPlantDeathSequence() {
    this.currentAnimation = this.draw
      .animate(3000 * this.animationSpeedRatio)
      .during((pos, morph, eased, situation) => {
        // show the death sequence animation leaf based on time
        if (pos < .33) {
          this.plantAnimationCorner.showLightGreenLeaf();
        } else if (pos < .66) {
          this.plantAnimationCorner.showYellowLeaf();
        } else {
          this.plantAnimationCorner.showDeadLeaf();
        }
      })
      .afterAll(() => {
        this.addEvent('plantDied');
        this.simulationEndFeedback.showPlantDied();

        const glucoseCreated = false;
        const glucoseUsed = false;
        this.updateGlucoseValues(this.currentDayNumber, glucoseCreated,
            glucoseUsed);
        this.graph.updateGraph(this.currentTrialData,
            this.currentDayNumber, glucoseCreated);
      });
  }

  removeMitochondrionBatteries() {
    if (this.mitochondrionBattery1 != null) {
      this.mitochondrionBattery1.remove();
    }
    if (this.mitochondrionBattery2 != null) {
      this.mitochondrionBattery2.remove();
    }
  }

  removeGlucoses() {
    if (this.glucose1 != null) {
      this.glucose1.remove();
    }
    if (this.glucose2 != null) {
      this.glucose2.remove();
    }
    if (this.glucose3 != null) {
      this.glucose3.remove();
    }
    if (this.glucose4 != null) {
      this.glucose4.remove();
    }
  }

  removeGlucosesInStorage() {
    this.glucosesInStorage.map((glucoseInStorage) => {
      glucoseInStorage.remove();
    });
    this.glucosesInStorage = [];
  }

  resetSimulation() {
    this.enableControlButtons();
    this.playBackControl.showPlayButton();
    this.simulationState = SimulationState.Stopped;

    if (this.currentAnimation != null) {
      this.currentAnimation.stop();
      this.currentAnimation = null;
    }
    if (this.photonsGroup != null) {
      this.photonsGroup.remove();
    }
    this.removeGlucoses();
    this.removeGlucosesInStorage();
    this.removeMitochondrionBatteries();
    this.resetEnergyToFull();
    this.plantAnimationCorner.showGreenLeaf();
    this.dayDisplayCorner.updateDayText('Day 1');

    // re-initialize the variables
    this.currentDayNumber = 0;
    this.totalGlucoseCreated = this.initialGlucoseCreated;
    this.totalGlucoseUsed = this.initialGlucoseUsed;
    this.totalGlucoseStored = this.initialGlucoseStored;
    this.simulationEndFeedback.hideAll();
    this.graph.resetGraph();
    this.feedback.hideFeedback();
    this.lightSwitch.hideWaitImage();
    this.startNewTrial();

    /*
    TODO: uncomment me when ready
    if (wiseAPI.wise5) {
      // get the student work from other components
      wiseAPI.getStudentWork();
    }
    */
  }

  disableControlButtons() {
    this.isControlEnabled = false;
    this.lightSwitch.disableUserInput();
    this.simulationSpeedSwitch.disableUserInput();
    $('#playPause').css('opacity', 0.3);
  }

  enableControlButtons() {
    this.isControlEnabled = true;
    this.lightSwitch.enableUserInput();
    this.simulationSpeedSwitch.enableUserInput();
    $('#playPause').css('opacity', 1);
  }

  /**
   * Add an event to the current trial data
   * @param eventName the name of the event
   */
  addEvent(eventName: string) {
    const event: Event = {
      name: eventName,
      timestamp: new Date().getTime()
    };
    this.currentTrialData.events.push(event);
  }

  pauseSimulation() {
    this.playBackControl.showPlayButton();
    if (this.currentAnimation != null) {
      this.currentAnimation.pause();
    }
    this.simulationState = SimulationState.Paused;
  }

  /**
   * @param newAnimationSpeedRatio A number for the new animation speed
   */
  updateAnimationSpeedRatio(newAnimationSpeedRatio: number) {
    this.animationSpeedRatio = newAnimationSpeedRatio;
    this.animationDuration =
      this.DEFAULT_ANIMATION_DURATION * this.animationSpeedRatio;
  }

  /**
   * Updates the model light energy percentage
   * @param requestedLightEnergyPercent the new energy percentage requested by
   * the user. Possible values are 0, 50, or 100
   */
  handleLightChangeRequest(requestedLightEnergyPercent: number) {
    this.lightEnergyPercent = requestedLightEnergyPercent;
    if (this.currentAnimation != null) {
      // show a wait image so the user knows the change will take effect
      // at the beginning of the next animation cycle
      this.lightSwitch.showWaitImage();
      if (requestedLightEnergyPercent >= 50) {
        // this variable will be read in at the beginning of the
        // next animation cycle
        this.isLightOnRequestedInNextCycle = true;
      } else {
        this.isLightOffRequestedInNextCycle = true;
      }
    } else {
      // turn the light on/off right now
      if (requestedLightEnergyPercent >= 50) {
        this.turnLightOn();
      } else {
        this.turnLightOff();
      }
    }
  }

  /**
   * Turn the light on which affect the number of photons to appear
   */
  turnLightOn() {
    if (this.lightEnergyPercent === 50) {
      this.glucoseCreatedIncrement = 2;
      this.glucoseUsedIncrement = 2;
    } else if (this.lightEnergyPercent === 100) {
      this.glucoseCreatedIncrement = 4;
      this.glucoseUsedIncrement = 2;
    }
    this.toggleLight(true);
  }

  /**
   * Turn the light off which makes no photons appear
   */
  turnLightOff() {
    this.toggleLight(false);
  }

  /**
   * Toggle light on or off. The effect is immediate.
   * @param doToggleOn
   */
  toggleLight(doToggleOn: boolean) {
    this.isLightOn = doToggleOn;
    this.dayDisplayCorner.updateDayColor(this.isLightOn);
    this.plantAnimationCorner.turnLightOn(this.isLightOn);
    this.lightSwitch.hideWaitImage();
  }

  /**
   * Create batteries that appear on the mitochondrion and returns the group
   */
  createMitochondrionBatteries() {
    this.mitochondrionBattery1 = this.draw.image('./batteryFull.png')
        .attr({
          'x': this.mitochondrionBattery1_startingX,
          'y': this.mitochondrionBattery1_startingY
        });
    this.mitochondrionBattery2 = this.draw.image('./batteryFull.png')
        .attr({
          'x': this.mitochondrionBattery2_startingX,
          'y': this.mitochondrionBattery2_startingY
        });
    return this.draw.set()
        .add(this.mitochondrionBattery1).add(this.mitochondrionBattery2);
  }
}
