"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Pokemon extends Model {
  categories() {
    return this.belongsTo("App/Models/Category");
  }
  types() {
    return this.belongsToMany("App/Models/Type").pivotTable("type_pokemons");
  }
}

module.exports = Pokemon;
