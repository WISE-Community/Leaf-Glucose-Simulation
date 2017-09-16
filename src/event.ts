/**
 * Event --- Represents events that occur in the simulation,
 * both user-generated ("button-clicked", "sliderMoved") and
 * simulation-generated ("simulation started", "end reached")
 */
export interface Event {
  name: string,
  timestamp: number
}
