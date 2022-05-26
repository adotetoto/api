const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const Pet = require("../models/Pet");

module.exports = class PetController {
  //? CRIANDO PET
  static async create(req, res) {
    const { name, age, weight, color } = req.body;
    const images = req.files;
    const available = true;

    //upload de imagens

    //validações
    if (!name) {
      res.status(422).json({ message: "O nome é obrigátorio" });
      return;
    }
    if (!age) {
      res.status(422).json({ message: "A idade é obrigátoria" });
      return;
    }
    if (!weight) {
      res.status(422).json({ message: "O peso é obrigátorio" });
      return;
    }
    if (!color) {
      res.status(422).json({ message: "A cor é obrigátoria" });
      return;
    }
    if (images.length === 0) {
      res.status(422).json({ message: "A imagem é obrigatória" });
      return;
    }
    //puxando o usuario para construir a relação
    const token = getToken(req);
    const user = await getUserByToken(token);
    //criando um objeto para salvar os dados do pet
    const pet = new Pet({
      name,
      age,
      weight,
      color,
      available,
      images: [],
      //definindo usuario puxando os dados pelo usuário descodificado
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        phone: user.phone,
      },
    });
    images.map((image) => {
      pet.images.push(image.filename);
    });

    //salvando no banco
    try {
      const newPet = await pet.save();
      res.status(201).json({
        message: "Pet cadastrado com sucesso!",
        newPet,
      });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
};
