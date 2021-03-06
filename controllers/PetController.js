const Pet = require("../models/Pet");
//!HELPERS
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class PetController {
  //? CRIANDO PET
  static async create(req, res) {
    const { name, age, weight, size, description, sex, color } = req.body;
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
    if (age < 0) {
      res
        .status(422)
        .json({
          message:
            " A idade deve ser maior que 0 ou igual para pets que tem meses ",
        });
      return;
    }
    if (!weight) {
      res.status(422).json({ message: "O peso é obrigátorio" });
      return;
    }
    if (weight <= 0) {
      res.status(422).json({ message: "O peso é menor ou igual a zero" });
      return;
    }
    if (!color) {
      res.status(422).json({ message: "A cor é obrigátoria" });
      return;
    }

    if (!size) {
      res.status(422).json({ message: "O porte é obrigátorio" });
      return;
    }

    if (!sex) {
      res.status(422).json({ message: "O sexo é obrigátorio" });
      return;
    }

    if (!description) {
      res.status(422).json({ message: "A descrição é obrigátoria" });
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
      sex,
      size,
      description,
      available,
      images: [],
      //definindo usuario puxando os dados pelo usuário descodificado
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        phone: user.phone,
        city: user.city,
        address: user.address,
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
  static async getAll(req, res) {
    const pets = await Pet.find().sort("-createAt");
    res.status(200).json({
      pets: pets,
    });
  }

  static async getAllUserPets(req, res) {
    // resgatar o token
    const token = getToken(req);

    //retornar o usuario descriptografando o token
    const user = await getUserByToken(token);

    // resgatando todos os pets do usuario,utilizando o id do token para buscar ou seja resgatando pela "referencia"
    const pets = await Pet.find({ "user._id": user._id }).sort("-createdAt");

    res.status(200).json({
      pets,
    });
  }
  static async getAllUserAdoptions(req, res) {
    // resgatar o token
    const token = getToken(req);

    //retornar o usuario descriptografando o token
    const user = await getUserByToken(token);

    // resgatando todos os pets do usuario,utilizando o id do token para buscar ou seja resgatando pela "referencia"
    const pets = await Pet.find({ "adopter._id": user._id }).sort("-createdAt");

    res.status(200).json({
      pets,
    });
  }
  static async getPetById(req, res) {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "ID inválido" });
      return;
    }
    const pet = await Pet.findOne({ _id: id });
    if (!pet) {
      res.status(404).json({ message: "Pet não encontrado" });
      return;
    }
    res.status(200).json({
      pet,
    });
  }

  static async removePetById(req, res) {
    const id = req.params.id;

    // verificar se o id é valido
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "ID inválido!" });
      return;
    }
    const pet = await Pet.findOne({ _id: id });
    if (!pet) {
      res.status(404).json({ message: "Pet não encontrado" });
      return;
    }

    // protege de um usuario excluir o dado de outro
    const token = getToken(req);
    const user = await getUserByToken(token);
    if (pet.user._id.toString() !== user._id.toString()) {
      res.status(402).json({
        message: "Tente novamente mais tarde",
      });
      return;
    }
    // removendo do banco o pet
    await Pet.findByIdAndDelete(id);
    res.status(200).json({ message: "Pet removido com sucesso" });
  }

  static async updatePet(req, res) {
    const id = req.params.id;

    const { name, age, weight, color, size, sex, description, available } =
      req.body;
    const images = req.files;
    const updateData = {};
    const pet = await Pet.findOne({ _id: id });
    //validações
    if (!name) {
      res.status(422).json({ message: "O nome é obrigátorio" });
      return;
    } else {
      updateData.name = name;
    }
    if (!age) {
      res.status(422).json({ message: "A idade é obrigátoria" });
      return;
    } else {
      if (age < 0) {
        res.status(422).json({
          message:
            "A idade deve ser maior que 0 ou igual para pets que tem meses ",
        });
        return;
      } else {
        updateData.age = age;
      }
    }
    if (!weight) {
      res
        .status(422)
        .json({ message: "O peso é obrigátorio e ele deve ser maior que 0" });
      return;
    } else {
      if (weight <= 0) {
        res.status(422).json({ message: "O peso é menor ou igual a zero" });
        return;
      } else {
        updateData.weight = weight;
      }
    }
    if (!color) {
      res.status(422).json({ message: "A cor é obrigátoria" });
      return;
    } else {
      if (
        color === "Branco" ||
        color === "Preto" ||
        color === "Cinza" ||
        color === "Caramelo" ||
        color === "Mesclado"
      ) {
        updateData.color = color;
      } else {
        res
          .status(422)
          .json({ message: "A cor informada não foi cadastrada no sistema" });
        return;
      }
      if (!size) {
        res.status(422).json({ message: "O porte é obrigátorio" });
        return;
      } else {
        if (size === "Pequeno" || size === "Medio" || size === "Grande") {
          updateData.size = size;
        } else {
          res
            .status(422)
            .json({ message: "O porte deve ser Pequeno,Médio ou Grande" });
          return;
        }
      }

      //! REFERENCIA VALIDAÇÕES SELECT
      if (!sex) {
        res.status(422).json({ message: "O sexo é obrigátorio" });
        return;
      } else {
        if (sex === "Macho" || sex === "Femea") {
          updateData.sex = sex;
        } else {
          res.status(422).json({ message: "O sexo deve ser Macho ou Femea" });
          return;
        }
      }
      if (!description) {
        res.status(422).json({ message: "A descrição é obrigátoria" });
        return;
      } else {
        updateData.description = description;
      }

      if (images.length > 0) {
        updateData.images = [];
        images.map((image) => {
          updateData.images.push(image.filename);
        });
      }

      if (!pet) {
        res.status(404).json({ message: "Pet não encontrado!" });
        return;
      }

      // check if user registered this pet
      const token = getToken(req);
      const user = await getUserByToken(token);

      if (pet.user._id.toString() != user._id.toString()) {
        res.status(404).json({
          message: "Tente novamente mais tarde!",
        });
        return;
      }

      await Pet.findByIdAndUpdate(id, updateData);
      res.status(200).json({ message: "Pet atualizado com sucesso" });
    }
  }

  static async schedule(req, res) {
    const id = req.params.id;
    const pet = await Pet.findOne({ _id: id });
    if (!pet) {
      res.status(404).json({ message: "Pet não encontrado" });
      return;
    }

    //evitando visita com proprio PET
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.equals(user._id)) {
      res.status(404).json({
        message: "Você não pode agendar uma visita com o seu próprio Pet!",
      });
      return;
    }
    //evitando um agendamento já existente
    // pet tem um adotador ?
    if (pet.adopter) {
      if (pet.adopter._id.equals(user._id)) {
        res.status(422).json({
          message: "Você ja agendou uma visita para este Pet!",
        });
        return;
      }
    }

    //adicionando o adotador no pet
    pet.adopter = {
      _id: user._id,
      name: user.name,
      image: user.image,
    };

    await Pet.findByIdAndUpdate(id, pet);
    res.status(200).json({
      message: `A visita foi agendada com sucesso,entre em contato com ${pet.user.name}`,
    });
  }

  //! FILTROS DE SEXO
  static async getSexMale(req, res) {
    const pets = await Pet.find({ sex: "Macho" }).sort("-createAt");
    res.status(200).json({
      pets: pets,
    });
  }
  static async getSexFemale(req, res) {
    const pets = await Pet.find({ sex: "Fêmea" }).sort("-createAt");
    res.status(200).json({
      pets: pets,
    });
  }

  //! FILTROS DE CIDADE
  static async getCityPortoAlegre(req, res) {
    const pets = await Pet.find({ "user.city": "Porto Alegre" }).sort(
      "-createAt"
    );
    res.status(200).json({
      pets: pets,
    });
  }
  static async getCityViamao(req, res) {
    const pets = await Pet.find({ "user.city": "Viamão" }).sort("-createAt");
    res.status(200).json({
      pets: pets,
    });
  }
  static async getCityCanoas(req, res) {
    const pets = await Pet.find({ "user.city": "Canoas" }).sort("-createAt");
    res.status(200).json({
      pets: pets,
    });
  }
  static async getCityGravatai(req, res) {
    const pets = await Pet.find({ "user.city": "Gravatai" }).sort("-createAt");
    res.status(200).json({
      pets: pets,
    });
  }
  static async getCityCachoeirinha(req, res) {
    const pets = await Pet.find({ "user.city": "Cachoeirinha" }).sort(
      "-createAt"
    );
    res.status(200).json({
      pets: pets,
    });
  }
  static async getCityEsteio(req, res) {
    const pets = await Pet.find({ "user.city": "Esteio" }).sort("-createAt");
    res.status(200).json({
      pets: pets,
    });
  }

  //!FILTROS DE PORTE
  static async getSizeSmall(req, res) {
    const pets = await Pet.find({ size: "Pequeno" }).sort("-createAt");
    res.status(200).json({
      pets: pets,
    });
  }
  static async getSizeMedium(req, res) {
    const pets = await Pet.find({ size: "Médio" }).sort("-createAt");
    res.status(200).json({
      pets: pets,
    });
  }
  static async getSizeGreat(req, res) {
    const pets = await Pet.find({ size: "Grande" }).sort("-createAt");
    res.status(200).json({
      pets: pets,
    });
  }

  // concluindo adoção
  static async concludeAdoption(req, res) {
    const id = req.params.id;

    // verificar se o pet existe
    const pet = await Pet.findOne({ _id: id });

    //pet nao esta mais avaliado fazendo update
    pet.available = false;

    await Pet.findByIdAndUpdate(pet._id, pet);

    res.status(200).json({
      pet: pet,
      message: `Parabéns! O ciclo de adoção foi finalizado com sucesso!`,
    });
  }
};
