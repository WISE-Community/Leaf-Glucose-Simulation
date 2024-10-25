export class Settings {
  enableInputControls = true;
  feedbackPolicy: string = null;
  isDroughtTolerant = false;
  isShadeTolerant = false;
  numDays = 20;
  numLightOptions = 2;
  plantImgSrc: string = null;
  showEnergyNeeds = false;
  showGraph = true;
  showKey = true;
  showLineGlucoseMade = true;
  showLineGlucoseUsed = true;
  showLineGlucoseStored = true;
  showWater = false;

  constructor(parameters: any) {
    if (parameters['numDays'] != null) {
      this.numDays = parameters['numDays'];
    }
    if (parameters['numLightOptions'] != null) {
      this.numLightOptions = parameters['numLightOptions'];
    }
    if (parameters['feedbackPolicy'] != null) {
      this.feedbackPolicy = parameters['feedbackPolicy'];
    }
    if (parameters['showGraph'] != null) {
      this.showGraph = parameters['showGraph'];
    }
    if (parameters['showLineGlucoseMade'] != null) {
      this.showLineGlucoseMade = parameters['showLineGlucoseMade'];
    }
    if (parameters['showLineGlucoseUsed'] != null) {
      this.showLineGlucoseUsed = parameters['showLineGlucoseUsed'];
    }
    if (parameters['showLineGlucoseStored'] != null) {
      this.showLineGlucoseStored = parameters['showLineGlucoseStored'];
    }
    if (parameters['showWater'] != null) {
      this.showWater = parameters['showWater'];
    }
    if (parameters['showKey'] != null) {
      this.showKey = parameters['showKey'];
    }
    if (parameters['enableInputControls'] != null) {
      this.enableInputControls = parameters['enableInputControls'];
    }
    if (parameters['isDroughtTolerant'] != null) {
      this.isDroughtTolerant = parameters['isDroughtTolerant'];
    }
    if (parameters['isShadeTolerant'] != null) {
      this.isShadeTolerant = parameters['isShadeTolerant'];
    }
    if (parameters['plantImgSrc'] != null) {
      this.plantImgSrc = parameters['plantImgSrc'];
    }
    if (parameters['showEnergyNeeds']) {
      this.showEnergyNeeds = true;
    }
  }
}
