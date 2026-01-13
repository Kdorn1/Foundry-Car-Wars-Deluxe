import { CarWarsActor } from "./base-actor.js";
import { CarWarsVehicleDataModel } from "./vehicle-data.js";

export class CarWarsVehicleActor extends CarWarsActor {
  static defineSchema() {
    return CarWarsVehicleDataModel;
  }
}
