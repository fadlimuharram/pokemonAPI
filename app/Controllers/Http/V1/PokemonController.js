"use strict";

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Pokemon = use("App/Models/Pokemon");
const { validate } = use("Validator");
const Helpers = use("Helpers");
const fs = require("fs");
/**
 * Resourceful controller for interacting with pokemons
 */
class PokemonController {
  /**
   * Show a list of all pokemons.
   * GET pokemons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, view }) {
    const requestList = request.only([
      "name_like",
      "category",
      "type_in",
      "limit",
      "page"
    ]);
    const page = parseInt(requestList.page, 10) || 1;
    const limit = parseInt(requestList.limit, 10) || 10;

    const query = Pokemon.query();

    if (requestList.name_like) {
      console.log("tt");
      query.whereRaw(`name LIKE '%${requestList.name_like}%'`);
    }

    if (requestList.category) {
      query.where("category_id", requestList.category);
    }

    // if (requestList.type_in) {
    //   console.log(JSON.parse(requestList.type_in));
    //   const wIn = JSON.parse(requestList.type_in);
    //   // query.where("types.id", wherein);
    //   if (wIn.length > 0) {
    //     query.whereIn("types", wIn);
    //   }
    // }
    query.with("categories");
    query.with("types");

    let pokemon = await query.paginate(page, limit);

    return response.json({
      ...pokemon
    });
  }

  /**
   * Render a form to be used for creating a new pokemon.
   * GET pokemons/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create({ request, response, view }) {}

  /**
   * Create/save a new pokemon.
   * POST pokemons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    const rules = {
      category_id: "required",
      name: "required",
      latitude: "required",
      longitude: "required",
      types: "required"
    };

    const validation = await validate(request.all(), rules);
    if (validation.fails()) {
      return response
        .status(400)
        .json({ status: 0, message: validation.messages() });
    }

    const img = request.file("image_url", {
      type: ["image"],
      size: "2mb",
      extnames: ["png", "jpg"]
    });

    const name = img.clientName;
    const ext = name.split(".")[1];
    const ts = new Date().valueOf();
    const fileName = "poke" + ts + "." + ext;

    await img.move(Helpers.publicPath("uploads"), {
      name: fileName
    });

    if (!img.moved()) {
      return response.status(400).json({ status: 0, message: img.error() });
    } else {
      const data = {
        category_id: request.input("category_id"),
        name: request.input("name"),
        latitude: request.input("latitude"),
        longitude: request.input("longitude"),
        image_url: fileName
      };
      const pokemon = await Pokemon.create(data);
      await pokemon.types().attach(request.input("types"));
      pokemon.types = await pokemon.types().fetch();

      return response.status(201).json(pokemon);
    }
  }

  /**
   * Display a single pokemon.
   * GET pokemons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request, response, view }) {
    const pokemon = await Pokemon.query()
      .with("categories")
      .with("types")
      .where("id", params.id)
      .fetch();

    return response.json({
      rows: pokemon.rows[0]
    });
  }

  /**
   * Render a form to update an existing pokemon.
   * GET pokemons/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit({ params, request, response, view }) {}

  /**
   * Update pokemon details.
   * PUT or PATCH pokemons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {
    /*
    category_id: "required",
      name: "required",
      latitude: "required",
      longitude: "required",
      types: "required"
      image_url
    */

    const category_id = request.input("category_id");
    const name = request.input("name");
    const latitude = request.input("latitude");
    const longitude = request.input("longitude");
    const types = request.input("types");

    const pokemon = await Pokemon.find(params.id);
    pokemon.name = name || pokemon.name;
    pokemon.latitude = latitude || pokemon.latitude;
    pokemon.longitude = longitude || pokemon.longitude;
    pokemon.category_id = category_id || pokemon.category_id;

    const pokemonPic = request.file("image_url", {
      type: ["image"],
      size: "2mb",
      extnames: ["png", "jpg"]
    });
    if (pokemonPic === null) {
      await pokemon.save();
    } else {
      const name = pokemonPic.clientName;
      const ext = name.split(".")[1];
      const ts = new Date().valueOf();
      const fileName = "poke" + ts + "." + ext;

      await pokemonPic.move(Helpers.publicPath("uploads"), {
        name: fileName
      });

      const linkOldPicture =
        Helpers.publicPath("uploads") + "/" + pokemon.image_url;
      fs.unlink(linkOldPicture, function(err) {
        if (err) response.status(400).json({ status: 0, error: err });
      });
      pokemon.image_url = fileName;
      await pokemon.save();
    }

    if (types) {
      await pokemon.types().detach();
      await pokemon.types().attach(types);
      pokemon.types = await pokemon.types().fetch();
    }

    return response.json({
      data: pokemon
    });
  }

  /**
   * Delete a pokemon with id.
   * DELETE pokemons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {
    const pokemon = await Pokemon.find(params.id);
    const oldPokemon = pokemon;

    if (!pokemon) {
      return response.status(404).json({ status: 0 });
    }

    const oldPicture = Helpers.publicPath("uploads") + "/" + pokemon.image_url;
    fs.unlink(oldPicture, function(err) {
      if (err) response.status(400).json({ status: 0, error: err });
    });

    await pokemon.delete();
    return response.status(200).json({
      status: 1,
      data: oldPokemon
    });
  }
}

module.exports = PokemonController;
