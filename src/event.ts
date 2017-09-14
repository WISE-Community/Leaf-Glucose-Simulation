/**
 * Event --- Represents events that occur in the simulation, both explicit
 * and implicit.
 * ex: light on/off, simulation started/ended
 */
export interface Event {
  name: string,
  timestamp: number
}
