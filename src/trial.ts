export class Trial {
  id: number;
  name: string;
  glucoseCreated: number[][] = [[0, 0]];
  glucoseUsed: number[][] = [[0, 0]];
  glucoseStored: number[][] = [[0, 0]];
  lightLevel: number[][];
  waterLevel: number[][];
  events: any[] = [];

  constructor(name: string, numPhotons: number, numWater: number) {
    this.id = new Date().getTime();
    this.name = name;
    this.lightLevel = [[0, numPhotons]];
    this.waterLevel = [[0, numWater]];
  }

  addDayData(
    dayNumber: number,
    glucoseCreated: number,
    glucoseUsed: number,
    glucoseStored: number,
    lightLevel: number,
    waterLevel: number
  ): void {
    this.glucoseCreated.push([dayNumber, glucoseCreated]);
    this.glucoseUsed.push([dayNumber, glucoseUsed]);
    this.glucoseStored.push([dayNumber, glucoseStored]);
    this.lightLevel.push([dayNumber, lightLevel]);
    this.waterLevel.push([dayNumber, waterLevel]);
  }
}
