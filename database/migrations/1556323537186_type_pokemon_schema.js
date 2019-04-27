"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class TypePokemonSchema extends Schema {
  up() {
    this.create("type_pokemons", table => {
      table.increments();
      table
        .integer("pokemon_id")
        .unsigned()
        .references("id")
        .inTable("pokemons")
        .onDelete("CASCADE");
      table
        .integer("type_id")
        .unsigned()
        .references("id")
        .inTable("types")
        .onDelete("CASCADE");
      table.timestamps();
    });
  }

  down() {
    this.drop("type_pokemons");
  }
}

module.exports = TypePokemonSchema;
