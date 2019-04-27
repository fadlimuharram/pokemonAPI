"use strict";

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use("Route");

Route.get("/", () => {
  return { greeting: "Hello world in JSON" };
});

Route.group(() => {
  Route.resource("pokemon", "V1/PokemonController").except(["index", "show"]);
  Route.resource("categories", "V1/CategoryController").except(["index"]);
  Route.resource("types", "V1/TypeController").except(["index"]);
})
  .prefix("api/v1")
  .middleware(["auth"]);

Route.group(() => {
  Route.resource("pokemon", "V1/PokemonController").only(["index", "show"]);
  Route.resource("categories", "V1/CategoryController").only(["index"]);
  Route.resource("types", "V1/TypeController").only(["index"]);

  Route.post("users/register", "V1/AuthController.register");
  Route.post("users/login", "V1/AUthController.login");
  Route.post("users/refresh", "V1/AuthCOntroller.generateRefreshToken");
}).prefix("api/v1");
