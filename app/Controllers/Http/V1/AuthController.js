"use strict";
const User = use("App/Models/User");
const { validate } = use("Validator");
const Helpers = use("Helpers");
const fs = require("fs");
class AuthController {
  async register({ request, auth, response }) {
    const rules = {
      username: "required|string",
      email: "required|email",
      password: "required|string",
      confirm_password: "required|string"
    };

    const validation = await validate(request.all(), rules);

    if (validation.fails()) {
      return response
        .status(400)
        .json({ status: 0, message: validation.messages() });
    }

    const username = request.input("username");
    const email = request.input("email");
    const password = request.input("password");
    const confirm_password = request.input("confirm_password");
    if (password !== confirm_password)
      return response
        .status(400)
        .json({ status: 0, message: "password not match" });

    let user = new User();
    user.username = username;
    user.email = email;
    user.password = password;
    await user.save();

    let accessToken = await auth.withRefreshToken().generate(user);
    return response.json({
      user: user,
      access_token: accessToken
    });
  }

  async login({ request, auth, response }) {
    const rules = {
      email: "required|email",
      password: "required|string"
    };

    const validation = await validate(request.all(), rules);

    if (validation.fails()) {
      return response
        .status(400)
        .json({ status: 0, message: validation.messages() });
    }

    const email = request.input("email");
    const password = request.input("password");

    try {
      if (await auth.attempt(email, password)) {
        let user = await User.findBy("email", email);
        let accessToken = await auth.withRefreshToken().generate(user);

        return response.json({ user: user, access_token: accessToken });
      }
    } catch (e) {
      return response.status(402).json({
        status: 0,
        message: "you first need to register"
      });
    }
  }

  async generateRefreshToken({ request, auth, response }) {
    const rules = {
      refresh_token: "required|string"
    };

    const validation = await validate(request.all(), rules);

    if (validation.fails()) {
      return response
        .status(400)
        .json({ status: 0, message: validation.messages() });
    }

    const refreshToken = request.input("refresh_token");
    const access_token = await auth
      .newRefreshToken()
      .generateForRefreshToken(refreshToken);
    return response.send({ status: 1, access_token });
  }

  async getProfile({ response, auth }) {
    return response.send({ status: 1, user: auth.current.user });
  }

  async editProfile({ params, request, response, auth }) {
    let rules = {
      username: "string",
      email: "email",
      password: "string"
    };

    if (request.input("password")) {
      rules = {
        ...rules,
        confirm_password: "required|string"
      };
    }

    const validation = await validate(request.all(), rules);
    if (validation.fails()) {
      return response
        .status(400)
        .json({ status: 0, message: validation.messages() });
    }

    const dataUser = await auth.getUser();

    const username = request.input("username");
    const email = request.input("email");
    const password = request.input("passowrd");
    const user = await User.find(dataUser.id);
    if (email) {
      const findSameEmail = await User.query()
        .where("email", email)
        .where("email", "<>", user.email)
        .count();
      if (findSameEmail > 0) {
        return response.json({
          status: 0,
          message: "email already taken"
        });
        user.email = email;
      }
    }

    if (password) {
      const confirm_password = request.input("confirm_password");
      if (confirm_password !== password) {
        return response.json({
          status: 0,
          message: "password not match"
        });
      }
      user.password = password;
    }

    user.username = username ? username : user.username;

    await user.save();
  }
}

module.exports = AuthController;
