import { Event } from './event';
import { Feedback } from './feedback';
import { SimulationState } from './simulationState';
import * as SVG from 'svg.js';
type SVG = typeof SVG;
import 'svg.draggable.js';
import * as $ from 'jquery';
import { WISEAPI } from './wiseAPI';
import { Battery1 } from './battery1';
import { Battery2 } from './battery2';
import { GlucoseToStorage1 } from './glucoseToStorage1';
import { GlucoseToStorage2 } from './glucoseToStorage2';
import { GlucoseToMitochondrion1 } from './glucoseToMitochondrion1';
import { GlucoseToMitochondrion2 } from './glucoseToMitochondrion2';
import { Photons } from './photons';
import { Chloroplast } from './chloroplast';
import { Storage } from './storage';
import { Mitochondrion } from './mitochondrion';
import { GlucoseToStorage } from './glucoseToStorage';
import {
  DEFAULT_ANIMATION_DELAY,
  DEFAULT_ANIMATION_DURATION,
} from './constants';
import { Settings } from './settings';
import { Trial } from './trial';
import { convertToHighchartsTrial } from './highchartsTrialConverter';
import { eventBus } from './eventBus';

/**
 * PlantGlucoseSimulation --- Simulation showing the inside of a plant
 * during Photosynthesis.
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
export class PlantGlucoseSimulation {
  // ratio speed for each animation to complete. 0 = stop -> 1 = full speed
  animationSpeedRatio: number = 1;

  // actual amount of time (in ms) each animation should take to complete
  animationDuration: number =
    DEFAULT_ANIMATION_DURATION * this.animationSpeedRatio;

  // actual amount of time (in ms) delay before starting animation
  animationDelay: number = DEFAULT_ANIMATION_DELAY * this.animationSpeedRatio;

  private chloroplast: Chloroplast;
  private currentAnimation: SVG.Set;
  currentDayNumber: number = 0;
  currentTrial: Trial;
  draw: SVG.Doc;
  private energyLeft: number = 100;
  feedback: Feedback;

  // the amount of glucose to add/subtract each day
  private glucoseCreatedIncrement: number = 4;
  private glucoseUsedIncrement: number = 2;

  private glucoseToMitochondrion1: GlucoseToMitochondrion1;
  private glucoseToMitochondrion2: GlucoseToMitochondrion2;
  private glucoseToStorage1: GlucoseToStorage1;
  private glucoseToStorage2: GlucoseToStorage2;
  glucosesInStorage: SVG.Image[] = [];
  instructions: any[] = [];
  isControlEnabled: boolean = true;
  isLightOn: boolean = true;
  numDays: number = 20;
  private mitochondrion: Mitochondrion;
  private mitochondrionBattery1: Battery1;
  private mitochondrionBattery2: Battery2;
  numPhotonsNextCycle: number;
  numPhotonsThisCycle: number = 4;
  numWaterNextCycle: number;
  numWaterThisCycle: number = 4;

  private photonsGroup: Photons;
  private playSequence: any[] = [];
  private simulationState: SimulationState = SimulationState.Stopped;
  private storage: Storage;
  private totalGlucoseCreated: number;
  private totalGlucoseUsed = 0;
  private trials: any[] = []; // an array of trial data objects including the current trial
  private wiseAPI: WISEAPI;

  private blobCircleRadius = 10;

  /**
   * Instantiates variables with initial values for objects
   * within the simulation. Controlling the simulation (play/pause/reset)
   * is done through the PlayPauseButton, ResetButton, and and SimulationSpeedSwitch classes.
   * @param elementId A string containing the id of the DOM element where
   * the simulation should be displayed
   * @param settings initial settings for the simulation
   */
  constructor(elementId: string, private settings: Settings) {
    this.draw = SVG(elementId);
    this.numDays = this.settings.numDays;
    this.chloroplast = new Chloroplast(this);
    this.mitochondrion = new Mitochondrion(this);
    this.storage = new Storage(this);
    this.addInitialGlucosesToStorage();
    this.totalGlucoseCreated = this.settings.initialGlucoseStored;
    this.feedback = new Feedback(this.draw, this.settings.feedbackPolicy);
    this.wiseAPI = new WISEAPI(this);
    this.startNewTrial();
    this.setEnableControlButtons();
    eventBus
      .on('resetButtonClicked')
      .subscribe(() => this.handleResetButtonClicked());
    eventBus
      .on('playPauseButtonClicked')
      .subscribe(() => this.handlePlayPauseButtonClicked());
    eventBus.on('animationDeathSequenceEnded').subscribe(() => {
      this.handleAnimationDeathSequenceEnded();
    });
  }

  private addInitialGlucosesToStorage() {
    const realAnimationDuration = this.animationDuration;
    this.animationDuration = 500;
    for (let i = 0; i < this.settings.initialGlucoseStored; i++) {
      let glucose: GlucoseToStorage;
      glucose = new GlucoseToStorage1(this);
      glucose.animate();
      this.glucosesInStorage.push(glucose.getImage());
    }
    this.animationDuration = realAnimationDuration;
  }

  loadInstructions(instructions: any[]): void {
    this.playSequence = [];
    this.numDays = 0;
    for (let i = 0; i < instructions.length; i++) {
      this.addDaysToPlaySequence(instructions[i]);
    }
    this.resetSimulation();
    this.setInputValues(this.playSequence[0]);
    this.enableControlButtons();
  }

  private addDaysToPlaySequence(instruction: any): void {
    for (let i = 0; i < instruction.days; i++) {
      this.playSequence.push({
        light: instruction.light,
        water: instruction.water,
      });
      this.numDays++;
    }
  }

  private setInputValues(day: any): void {
    if (day) {
      eventBus.emit('lightChanged', day.light);
      eventBus.emit('waterChanged', day.water);
    }
  }

  private handleResetButtonClicked(): void {
    this.addEvent('resetButtonClicked');
    this.resetSimulation();
  }

  private handlePlayPauseButtonClicked(): void {
    if (this.isControlEnabled) {
      switch (this.simulationState) {
        case SimulationState.Stopped:
          this.addEvent('startButtonClicked');
          this.startSimulation();
          break;
        case SimulationState.Paused:
          this.addEvent('resumeButtonClicked');
          this.resumeSimulation();
          break;
        case SimulationState.Running:
          this.addEvent('pauseButtonClicked');
          this.pauseSimulation();
          break;
      }
    }
  }

  private startSimulation(): void {
    this.simulationState = SimulationState.Running;
    eventBus.emit('simulationStateChanged', SimulationState.Running);
    this.playAnimationCycle();
  }

  private resumeSimulation(): void {
    this.simulationState = SimulationState.Running;
    eventBus.emit('simulationStateChanged', SimulationState.Running);
    this.playOrPauseAnimation(false);
  }

  private pauseSimulation(): void {
    if (this.isAnimationPlaying()) {
      this.playOrPauseAnimation(true);
    }
    this.simulationState = SimulationState.Paused;
    eventBus.emit('simulationStateChanged', SimulationState.Paused);
  }

  private playOrPauseAnimation(isPausing: boolean): void {
    if (this.currentAnimation.members) {
      this.playOrPauseImages(isPausing);
    } else {
      this.playOrPause(this.currentAnimation, isPausing);
    }
  }

  private playOrPauseImages(isPausing: boolean): void {
    this.currentAnimation.members.forEach((animationObject: any) => {
      if (animationObject instanceof GlucoseToStorage1) {
        const glucoseImg = animationObject.getImage();
        this.playOrPause(glucoseImg, isPausing);
      } else {
        this.playOrPause(animationObject, isPausing);
      }
    });
  }

  private playOrPause(playOrPauseObject: any, isPausing: boolean): void {
    isPausing ? playOrPauseObject.pause() : playOrPauseObject.play();
  }

  private handleAnimationDeathSequenceEnded(): void {
    this.addEvent('plantDied');
    eventBus.emit('statusChanged', 'died');
    this.updateCurrentTrial(false, false);
    this.notifyStudentDataChanged();
    this.saveStudentWork();
  }

  private startNewTrial(): void {
    this.currentTrial = new Trial(
      `Trial (${this.trials.length + 1})`,
      this.numPhotonsThisCycle,
      this.numWaterThisCycle,
      this.settings.initialGlucoseStored
    );
    this.trials.push(this.currentTrial);
    this.notifyStudentDataChanged();
  }

  private updateCurrentTrial(
    glucoseCreated: boolean,
    glucoseUsed: boolean
  ): void {
    if (glucoseCreated && this.numWaterThisCycle > 0) {
      this.totalGlucoseCreated += this.glucoseCreatedIncrement;
    }
    if (glucoseUsed) {
      this.updateGlucoseUsed();
    }
    this.currentTrial.addDayData(
      this.currentDayNumber,
      this.totalGlucoseCreated,
      this.totalGlucoseUsed,
      this.getTotalGlucoseStored(),
      this.numPhotonsThisCycle,
      this.numWaterThisCycle
    );
  }

  private updateGlucoseUsed(): void {
    this.totalGlucoseUsed += this.glucoseUsedIncrement;
    if (
      (this.settings.isDroughtTolerant && this.numWaterThisCycle < 4) ||
      (this.settings.isShadeTolerant && this.numPhotonsThisCycle < 3)
    ) {
      this.totalGlucoseUsed--;
    }
  }

  /**
   * Run the plant animation cycle once.
   * A cycle is one complete cycle, with light and water on or off.
   * Light and water can be switched on/off during the cycle, but it will not take
   * effect until the next cycle.
   */
  private playAnimationCycle(): void {
    this.currentDayNumber++;
    if (this.currentDayNumber > this.numDays) {
      this.handleSimulationEnded();
    } else {
      eventBus.emit('dayChanged', this.currentDayNumber);
      if (this.shouldUpdateNumWaterThisCycle()) {
        this.updateNumWaterThisCycle(this.numWaterNextCycle);
      }
      if (this.shouldUpdateNumPhotonsThisCycle()) {
        this.updateNumPhotonsThisCycle(this.numPhotonsNextCycle);
      }
      eventBus.emit('animationCyclePhase1Started');
      if (
        this.getTotalGlucoseStored() === 0 &&
        (this.glucoseCreatedIncrement === 0 || this.numWaterThisCycle === 0)
      ) {
        // there is no energy coming in or stored. The plant dies now.
        this.currentAnimation = this.draw
          .animate({ duration: this.animationDuration * 3 })
          .during((pos, morph, eased, situation) => {
            this.drainEnergy(100, 0, pos);
          })
          .afterAll(() => {
            this.disableControlButtons();
            eventBus.emit('animationDeathSequenceStarted');
          });
      } else if (this.numPhotonsThisCycle > 0) {
        this.movePhotonsToPlantAndChloroplast(
          this.animationCallback.bind(this)
        );
      } else if (this.getTotalGlucoseStored() > 0) {
        this.moveGlucoseFromStorageToMitochondrion(
          this.animationCallback.bind(this)
        );
      }
      const nextDay = this.playSequence[this.currentDayNumber];
      if (nextDay) {
        this.setInputValues(nextDay);
      } else {
        this.numPhotonsNextCycle = null;
        this.numWaterNextCycle = null;
      }
    }
  }

  private shouldUpdateNumWaterThisCycle(): boolean {
    return (
      this.numWaterNextCycle != null &&
      this.numWaterNextCycle != this.numWaterThisCycle
    );
  }

  private shouldUpdateNumPhotonsThisCycle(): boolean {
    return (
      this.numPhotonsNextCycle != null &&
      this.numPhotonsNextCycle != this.numPhotonsThisCycle
    );
  }

  updateNumPhotonsThisCycle(numPhotonsThisCycle: number): void {
    this.numPhotonsThisCycle = numPhotonsThisCycle;
    eventBus.emit('numPhotonsChanged', numPhotonsThisCycle);
    this.glucoseCreatedIncrement = this.calculateGlucoseCreatedIncrement();
  }

  updateNumWaterThisCycle(numWaterThisCycle: number): void {
    this.numWaterThisCycle = numWaterThisCycle;
    eventBus.emit('numWaterChanged', numWaterThisCycle);
  }

  private animationCallback(): void {
    this.updateCurrentTrial(true, true);
    this.notifyStudentDataChanged();
    this.loopAnimationAfterBriefPause();
  }

  private notifyStudentDataChanged(): void {
    eventBus.emit('studentDataChanged');
    if (this.wiseAPI) {
      let state = {
        messageType: 'studentDataChanged',
        isAutoSave: false,
        isSubmit: false,
        studentData: {
          trial: convertToHighchartsTrial(this.currentTrial),
        },
      };
      this.wiseAPI.sendMessage(state);
    }
  }

  private saveStudentWork(): void {
    if (this.wiseAPI) {
      let state = {
        messageType: 'studentWork',
        isAutoSave: false,
        isSubmit: false,
        studentData: {
          trials: this.trials,
        },
      };
      this.wiseAPI.sendMessage(state);
    }
  }

  private loopAnimationAfterBriefPause(): void {
    window.setTimeout(() => {
      this.playAnimationCycle();
    }, this.animationDuration);
  }

  private movePhotonsToPlantAndChloroplast(animationCallback: () => {}): void {
    this.photonsGroup = new Photons(this);
    this.currentAnimation = this.photonsGroup.getGroup();
    this.photonsGroup.animate().afterAll(() => {
      this.photonsGroup.remove();
      this.photonsGroup = null;
      if (this.numWaterThisCycle > 0 && this.glucoseCreatedIncrement > 0) {
        this.createGlucosesToMitochondrion();
        this.createGlucosesToStorage();
        this.moveGlucoseFromChloroplastToMitochondrion(animationCallback);
      } else {
        this.moveGlucoseFromStorageToMitochondrion(animationCallback);
      }
    });
  }

  private moveGlucoseFromChloroplastToMitochondrion(
    animationCallback: () => {}
  ): void {
    this.currentAnimation = this.draw.set();
    if (this.glucoseToMitochondrion2 != null) {
      this.glucoseToMitochondrion2.animate().afterAll(() => {
        this.glucoseToMitochondrion2 = null;
        this.mitochondrionBattery2 = new Battery2(this);
      });
      this.currentAnimation.add(this.glucoseToMitochondrion2.getImage());
    }

    this.glucoseToMitochondrion1
      .animate()

      .afterAll(() => {
        this.glucoseToMitochondrion1.remove();
        this.mitochondrionBattery1 = new Battery1(this);
        if (
          this.glucoseCreatedIncrement === 1 &&
          !this.glucoseToMitochondrion2
        ) {
          this.moveGlucoseFromStorageToMitochondrion(() => {
            this.moveBatteryFromMitochondrionToEnergyIndicator(
              animationCallback
            );
          }, true /* requires assist */);
        } else {
          this.moveBatteryFromMitochondrionToEnergyIndicator(animationCallback);
        }
      });
    this.currentAnimation.add(this.glucoseToMitochondrion1.getImage());
  }

  /**
   * Update EnergyLeft to a value between from and to, based on the ratio.
   * @param from A number between 0 -> 100 starting max
   * @param to A number between 0 -> 100 ending min
   * @param ratio A number between 0 -> 1 ratio between from and to that
   * should be the new energyLeft
   */
  drainEnergy(from: number, to: number, ratio: number): void {
    this.energyLeft = from - (from - to) * ratio;
    eventBus.emit('energyLeftChanged', this.energyLeft);
  }

  /**
   * Create glucose that will be moved from chloroplast
   * to mitochondrion and returns a group containing them
   */
  private createGlucosesToMitochondrion(): void {
    if (this.glucoseCreatedIncrement >= 1) {
      this.glucoseToMitochondrion1 = new GlucoseToMitochondrion1(this);
    }
    if (this.glucoseCreatedIncrement >= 2) {
      this.glucoseToMitochondrion2 = new GlucoseToMitochondrion2(this);
    }
  }

  /**
   * Create glucose that will be moved from chloroplast
   * to storage and returns a group containing them
   */
  private createGlucosesToStorage(): void {
    if (this.glucoseCreatedIncrement === 3) {
      this.glucoseToStorage1 = new GlucoseToStorage1(this);
    } else if (this.glucoseCreatedIncrement === 4) {
      this.glucoseToStorage1 = new GlucoseToStorage1(this);
      this.glucoseToStorage2 = new GlucoseToStorage2(this);
    }
  }

  private moveGlucoseFromChloroplastToStorage(
    animationCallback: () => {}
  ): void {
    this.currentAnimation = this.draw.set();
    // move the glucose to storage in rows
    this.glucoseToStorage1.animate().afterAll(() => {
      this.glucosesInStorage.push(this.glucoseToStorage1.clone());
      this.glucoseToStorage1.remove();
      this.glucoseToStorage1 = null;
      if (this.glucoseCreatedIncrement !== 4) {
        animationCallback();
      } else {
        this.glucoseToStorage2.animate().afterAll(() => {
          this.glucosesInStorage.push(this.glucoseToStorage2.clone());
          this.glucoseToStorage2.remove();
          this.glucoseToStorage2 = null;
          animationCallback();
        });
        this.currentAnimation.add(this.glucoseToStorage2.getImage());
      }
    });
    this.currentAnimation.add(this.glucoseToStorage1.getImage());
  }

  /**
   * Move the glucose to center of mitochondrion during light OFF cycle
   * @param animationCallback A callback of animation
   */
  private moveGlucoseFromStorageToMitochondrion(
    animationCallback: () => {},
    requiresAssist: boolean = false
  ): void {
    if (this.getTotalGlucoseStored() === 0) {
      animationCallback();
    } else {
      this.currentAnimation = this.draw.set();
      let glucose1InStorage =
        this.glucosesInStorage[this.getTotalGlucoseStored() - 1];
      let glucose2InStorage: SVG.Image = null;

      if (this.getTotalGlucoseStored() >= 2 && !requiresAssist) {
        glucose2InStorage =
          this.glucosesInStorage[this.getTotalGlucoseStored() - 2];

        if (glucose2InStorage != null) {
          glucose1InStorage.rotate(0);
          glucose2InStorage.rotate(0);
          if (
            (this.settings.isDroughtTolerant && this.numPhotonsThisCycle > 2) ||
            (this.settings.isShadeTolerant && this.numWaterThisCycle > 0)
          ) {
            this.mitochondrionBattery2 = new Battery2(this);
          } else {
            glucose2InStorage
              .animate()
              .move(
                this.getMitochondrionBattery2StartPosition().x,
                this.getMitochondrionBattery1StartPosition().y
              )
              .animate()
              .opacity(0)
              .afterAll(() => {
                this.mitochondrionBattery2 = new Battery2(this);
              });
            this.currentAnimation.add(glucose2InStorage);
          }
        }
      }
      let moveToX = this.getMitochondrionBattery1StartPosition().x;
      let moveToY = this.getMitochondrionBattery1StartPosition().y;
      if (requiresAssist) {
        moveToX = this.getMitochondrionBattery2StartPosition().x;
        moveToY = this.getMitochondrionBattery2StartPosition().y;
      }
      glucose1InStorage
        .animate()
        .move(moveToX, moveToY)
        .during((pos, morph, eased, situation) => {
          if (!requiresAssist) {
            this.drainEnergy(100, 75, pos);
          }
        })
        .animate()
        .opacity(0)
        .during((pos, morph, eased, situation) => {
          if (!requiresAssist) {
            this.drainEnergy(75, 50, pos);
          }
        })
        .afterAll(() => {
          // remove the last glucose from storage
          this.glucosesInStorage.splice(this.getTotalGlucoseStored() - 1, 1);
          glucose1InStorage.remove();
          glucose1InStorage = null;
          if (
            glucose2InStorage != null &&
            ((!this.settings.isDroughtTolerant &&
              this.numWaterThisCycle === 0) ||
              (this.numPhotonsThisCycle < 3 && !this.settings.isShadeTolerant))
          ) {
            this.glucosesInStorage.splice(this.getTotalGlucoseStored() - 1, 1);
            glucose2InStorage.remove();
            glucose2InStorage = null;
          }
          if (this.glucoseCreatedIncrement === 1) {
            this.mitochondrionBattery2 = new Battery2(this);
            animationCallback();
          } else {
            this.mitochondrionBattery1 = new Battery1(this);
            this.moveBatteryFromMitochondrionToEnergyIndicator(
              animationCallback
            );
          }
        });
      this.currentAnimation.add(glucose1InStorage);
    }
  }

  private moveBatteryFromMitochondrionToEnergyIndicator(
    animationCallback: () => {}
  ): void {
    this.currentAnimation = this.draw.set();
    // move battery 2 to transport nutrients
    if (this.mitochondrionBattery2 != null) {
      this.mitochondrionBattery2.animate();
      this.currentAnimation.add(this.mitochondrionBattery2.getImage());
    }

    // move mitochondrion battery 1 to repair damage
    this.mitochondrionBattery1
      .animate()
      .during((pos, morph, eased, situation) => {
        if (this.isLightOn) {
          this.drainEnergy(20, 5, pos);
        } else {
          this.drainEnergy(50, 5, pos);
        }
      })
      .afterAll(() => {
        if (this.mitochondrionBattery2 != null) {
          this.resetEnergyToFull();
          this.removeMitochondrionBatteries();
          if (this.glucoseCreatedIncrement >= 3 && this.numWaterThisCycle > 0) {
            this.moveGlucoseFromChloroplastToStorage(animationCallback);
          } else {
            // there is no glucose to move to storage, so go directly to the callback
            animationCallback();
          }
        } else {
          this.disableControlButtons();
          eventBus.emit('animationDeathSequenceStarted');
        }
      });
    this.currentAnimation.add(this.mitochondrionBattery1.getImage());
  }

  private resetEnergyToFull(): void {
    this.energyLeft = 100;
    eventBus.emit('energyLeftChanged', this.energyLeft);
  }

  private handleSimulationEnded(): void {
    this.addEvent('simulationEnded');
    this.pauseSimulation();
    if (this.currentDayNumber === this.numDays + 1) {
      eventBus.emit('statusChanged', 'survived');
    } else {
      eventBus.emit('statusChanged', 'ended');
    }
    this.disableControlButtons();
    this.saveStudentWork();
  }

  private removeMitochondrionBatteries(): void {
    if (this.mitochondrionBattery1 != null) {
      this.mitochondrionBattery1.remove();
      this.mitochondrionBattery1 = null;
    }
    if (this.mitochondrionBattery2 != null) {
      this.mitochondrionBattery2.remove();
      this.mitochondrionBattery2 = null;
    }
  }

  private removeGlucoses(): void {
    if (this.glucoseToStorage1 != null) {
      this.glucoseToStorage1.remove();
    }
    if (this.glucoseToStorage2 != null) {
      this.glucoseToStorage2.remove();
    }
    if (this.glucoseToMitochondrion1 != null) {
      this.glucoseToMitochondrion1.remove();
    }
    if (this.glucoseToMitochondrion2 != null) {
      this.glucoseToMitochondrion2.remove();
    }

    this.glucosesInStorage.map((glucoseInStorage) => {
      glucoseInStorage.remove();
    });
    this.glucosesInStorage = [];
  }

  isAnimationPlaying(): boolean {
    return this.currentAnimation != null;
  }

  resetSimulation(): void {
    eventBus.emit('simulationReset');
    this.simulationState = SimulationState.Stopped;
    eventBus.emit('simulationStateChanged', SimulationState.Stopped);

    if (this.isAnimationPlaying()) {
      this.currentAnimation.stop();
      this.currentAnimation = null;
    }
    if (this.photonsGroup != null) {
      this.photonsGroup.remove();
    }
    this.removeGlucoses();
    this.removeMitochondrionBatteries();
    this.resetEnergyToFull();
    eventBus.emit('dayChanged', 1);

    this.currentDayNumber = 0;
    this.blobCircleRadius = 10;
    this.totalGlucoseCreated = this.settings.initialGlucoseStored;
    this.totalGlucoseUsed = 0;
    this.glucosesInStorage = [];
    this.addInitialGlucosesToStorage();
    this.feedback.hideFeedback();
    if (!this.settings.enableInputControls) {
      this.setInputValues(this.playSequence[0]);
    }
    this.startNewTrial();
    this.setEnableControlButtons();
  }

  private disableControlButtons(): void {
    this.isControlEnabled = false;
    eventBus.emit('inputControlsEnabled', false);
    $('#playPauseButton').css('opacity', 0.3);
  }

  private setEnableControlButtons(): void {
    if (this.settings.enableInputControls || this.playSequence.length) {
      this.enableControlButtons();
    } else {
      this.disableControlButtons();
    }
  }

  private enableControlButtons(): void {
    this.isControlEnabled = true;
    eventBus.emit('inputControlsEnabled', this.settings.enableInputControls);
    $('#playPauseButton').css('opacity', 1);
  }

  /**
   * Add an event to the current trial data
   * @param eventName the name of the event
   */
  addEvent(eventName: string): void {
    const event: Event = {
      name: eventName,
      timestamp: new Date().getTime(),
    };
    this.currentTrial.events.push(event);
  }

  /**
   * @param newAnimationSpeedRatio A number for the new animation speed
   */
  updateAnimationSpeedRatio(newAnimationSpeedRatio: number): void {
    this.animationSpeedRatio = newAnimationSpeedRatio;
    this.animationDuration =
      DEFAULT_ANIMATION_DURATION * this.animationSpeedRatio;
    this.animationDelay = DEFAULT_ANIMATION_DELAY * this.animationSpeedRatio;
  }

  private calculateGlucoseCreatedIncrement(): number {
    let glucoseCreatedIncrement = this.numPhotonsThisCycle;
    if (this.settings.isShadeTolerant) {
      const shadeTolerantPhotonsToCreated: any = {
        4: 4,
        3: 4,
        2: 3,
        1: 2,
        0: 0,
      };
      glucoseCreatedIncrement =
        shadeTolerantPhotonsToCreated[this.numPhotonsThisCycle];
    }
    return glucoseCreatedIncrement;
  }

  getStorage(): Storage {
    return this.storage;
  }

  getChloroplast(): Chloroplast {
    return this.chloroplast;
  }

  getMitochondrion(): Mitochondrion {
    return this.mitochondrion;
  }

  private getMitochondrionBattery1StartPosition(): any {
    return {
      x: this.mitochondrion.getX() + 100,
      y: this.mitochondrion.getY() + 100,
    };
  }

  private getMitochondrionBattery2StartPosition(): any {
    return {
      x: this.mitochondrion.getX() + 175,
      y: this.mitochondrion.getY() + 50,
    };
  }

  getSettings(): Settings {
    return this.settings;
  }

  getTotalGlucoseStored(): number {
    return this.glucosesInStorage.length;
  }

  getNextGlucoseStoredCoordinates(): [number, number] {
    const centerX = this.storage.getX() + 150;
    const centerY = this.storage.getY() + 130;
    const nextGlucoseNum = this.getTotalGlucoseStored() + 1;
    this.blobCircleRadius -= 1 / nextGlucoseNum;
    const groupNum = this.getGlucoseGroupNumber(nextGlucoseNum);
    const positionInGroup = this.getGlucosePositionInGroup(nextGlucoseNum);
    const isSquareGroup = this.isSquareGroup(groupNum);

    return this.getAdjustedCoordinates(
      centerX,
      centerY,
      groupNum,
      positionInGroup,
      isSquareGroup
    );
  }

  /**
   * Determines which group a glucose molecule is in where a group is a group
   * of four glucoses that will be displayed in the same ring.
   * @param glucoseNum number representing the glucose (the first glucose
   *                   stored would be 1, second would be 2, etc)
   */
  private getGlucoseGroupNumber(glucoseNum: number): number {
    let group = Math.ceil(glucoseNum / 4);
    if (glucoseNum >= 41) group -= 10;
    return group;
  }

  private getGlucosePositionInGroup(glucoseNum: number): number {
    for (let i = 0; i < 4; i++) {
      // The 4th member of the group is always a multiple of 4
      if ((glucoseNum + i) % 4 === 0) {
        return 4 - i;
      }
    }
  }

  /**
   * Determines whether a glucose is in a group to be displayed as a square
   * or a group to be displayed as a diamond.
   * @param groupNum a group of four glucoses (the first four are group 1, the
   *                 second four are group 2, etc)
   */
  private isSquareGroup(groupNum: number): boolean {
    return groupNum % 2 !== 0;
  }

  private getAdjustedCoordinates(
    centerX: number,
    centerY: number,
    groupNum: number,
    positionInGroup: number,
    isSquareGroup: boolean
  ): [number, number] {
    const groupRingRadius = this.getGroupRingRadius(groupNum, isSquareGroup);
    const xModifier = this.getCoordinateModifier(
      positionInGroup,
      isSquareGroup,
      true
    );
    const yModifier = this.getCoordinateModifier(
      positionInGroup,
      isSquareGroup,
      false
    );
    const adjustedX = centerX + groupRingRadius * xModifier;
    const adjustedY = centerY + groupRingRadius * yModifier;
    return [adjustedX, adjustedY];
  }

  private getGroupRingRadius(groupNum: number, isSquareGroup: boolean): number {
    return (
      (this.blobCircleRadius * groupNum * Math.sqrt(2)) /
      (isSquareGroup ? 2 : 1)
    );
  }

  private getCoordinateModifier(
    positionInGroup: number,
    isSquareGroup: boolean,
    isXCoord: boolean
  ): number {
    if (isXCoord) {
      switch (positionInGroup) {
        case 1:
          return isSquareGroup ? 1 : 0;
        case 2:
          return 1;
        case 3:
          return isSquareGroup ? -1 : 0;
        case 4:
          return -1;
      }
    } else {
      switch (positionInGroup) {
        case 1:
          return 1;
        case 2:
          return isSquareGroup ? -1 : 0;
        case 3:
          return -1;
        case 4:
          return isSquareGroup ? 1 : 0;
      }
    }
  }
}
