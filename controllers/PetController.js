const Pet = require("../models/Pet");

module.exports = class PetController {
  //? CRIANDO PET
  static async create(req, res) {
    res.json({ message: "Deu certo!" });
  }
};
