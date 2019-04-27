"use strict";

/*
|--------------------------------------------------------------------------
| PokemonSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/
const Category = use("App/Models/Category");
const Type = use("App/Models/Type");
const Pokemon = use("App/Models/Pokemon");

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use("Factory");

class PokemonSeeder {
  async run() {
    const category1 = new Category();
    category1.name = "Dragon";
    await category1.save();

    const category2 = new Category();
    category2.name = "Seed";
    await category2.save();

    const category3 = new Category();
    category3.name = "Duck";
    await category3.save();

    const type1 = new Type();
    type1.name = "physic";
    await type1.save();

    const type2 = new Type();
    type2.name = "fire";
    await type2.save();

    const type3 = new Type();
    type3.name = "water";
    await type3.save();

    const pokemonJSON = {
      name: "Psyduck",
      image_url:
        "https://cdn.bulbagarden.net/upload/thumb/5/53/054Psyduck.png/1200px-054Psyduck.png",
      latitude: "1233423",
      longitude: "-2233423",
      category_id: category1.id
    };

    const pokemon1 = await Pokemon.create(pokemonJSON);

    const pokemon1Types = [1, 2];

    await pokemon1.types().attach(pokemon1Types);
    // pokemon1.types = await pokemon1.tags().fetch();

    // pokemon_id
    // type_id

    // const
  }
}

module.exports = PokemonSeeder;
