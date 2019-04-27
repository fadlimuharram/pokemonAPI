"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class PokemonSchema extends Schema {
  up() {
    this.create("pokemons", table => {
      table.increments();
      table.string("name", 50).notNullable();
      table.string("image_url").notNullable();
      table.string("latitude", 25).notNullable();
      table.string("longitude", 25).notNullable();
      table
        .integer("category_id")
        .unsigned()
        .references("id")
        .inTable("categories")
        .onDelete("CASCADE");
      table.timestamps();
    });
  }

  down() {
    this.drop("pokemons");
  }
}

module.exports = PokemonSchema;
