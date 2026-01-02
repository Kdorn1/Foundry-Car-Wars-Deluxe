// module/actor/driver-data.js

export class CarWarsDriverDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      name: new foundry.data.fields.StringField({ required: true, initial: "" }),
      skillLevel: new foundry.data.fields.NumberField({ required: true, initial: 1 }),
      notes: new foundry.data.fields.StringField({ initial: "" })
    };
  }
}
