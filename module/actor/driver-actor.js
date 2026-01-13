// module/actor/driver-actor.js

import { CarWarsActor } from "./base-actor.js";
import { CarWarsDriverDataModel } from "./driver-data.js";

export class CarWarsDriverActor extends CarWarsActor {
  static defineSchema() {
    // Return the schema defined by the DataModel
    return CarWarsDriverDataModel.defineSchema();
  }
}
