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
    this.numDays = parameters['numDays'] ?? 20;
    this.numLightOptions = parameters['numLightOptions'] ?? 2;
    this.feedbackPolicy = parameters['feedbackPolicy'] ?? null;
    this.showGraph = parameters['showGraph'] ?? true;
    this.showLineGlucoseMade = parameters['showLineGlucoseMade'] ?? true;
    this.showLineGlucoseUsed = parameters['showLineGlucoseUsed'] ?? true;
    this.showLineGlucoseStored = parameters['showLineGlucoseStored'] ?? true;
    this.showWater = parameters['showWater'] ?? false;
    this.showKey = parameters['showKey'] ?? true;
    this.enableInputControls = parameters['enableInputControls'] ?? true;
    this.isDroughtTolerant = parameters['isDroughtTolerant'] ?? false;
    this.isShadeTolerant = parameters['isShadeTolerant'] ?? false;
    this.plantImgSrc = parameters['plantImgSrc'] ?? null;
    this.showEnergyNeeds = parameters['showEnergyNeeds'] ?? false;
  }
}
