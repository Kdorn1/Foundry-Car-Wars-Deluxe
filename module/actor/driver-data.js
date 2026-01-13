// module/actor/driver-data.js
// Clean, modern V12+ DataModel for Car Wars drivers (schema unchanged)

export class CarWarsDriverDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const { StringField, NumberField } = foundry.data.fields;

    return {
      name: new StringField({ required: true, initial: "" }),
      skillLevel: new NumberField({ required: true, initial: 1 }),
      notes: new StringField({ initial: "" })
    };
  }
}
