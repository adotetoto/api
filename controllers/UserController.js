const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//helpers
const createUserToken = require("../helpers/create-token-user");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
module.exports = class UserController {
  static async register(req, res) {
    const { name, email, phone, city, address, password, confirmpassword } =
      req.body;

    //* validações de campos digitados
    if (!name) {
      res.status(422).json({ message: "O nome é obrigatorio" });
      return;
    }

    if (!email) {
      res.status(422).json({ message: "O email é obrigatorio" });
      return;
    }
    if (!phone) {
      res.status(422).json({ message: "O telefone  é obrigatorio" });
      return;
    }
    if (!city) {
      res.status(422).json({ message: "A cidade é obrigatoria" });
      return;
    }

    if (!address) {
      res.status(422).json({ message: "O endereço é obrigatoria" });
      return;
    }
    if (!password) {
      res.status(422).json({ message: "A senha é obrigatoria" });
      return;
    }
    if (!confirmpassword) {
      res.status(422).json({ message: "A confirmação da senha é obrigatoria" });
      return;
    }

    //* validação se senha e confirmação de senha são iguais
    if (password !== confirmpassword) {
      res
        .status(422)
        .json({ message: "A senha e a confirmação devem ser iguais" });
      return;
    }

    //* validação se o usuário existe
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      res
        .status(422)
        .json({ message: "Email já utilizado,por favor informe outro e-mail" });
      return;
    }

    /* 
      Criptografando a senha
      1- definir um salt de 10 caracters
      2 - salvando a senha = atribuindo o salt e a senha
    */

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // criar um novo objeto para popular os dados vindo da req instancia o model
    const user = new User({
      name,
      email,
      phone,
      city,
      address,
      password: passwordHash,
    });

    // para fazer algum salvamento no banco é aconselhavel usar try catch,pois depende de questões externas

    try {
      const newUser = await user.save();
      await createUserToken(newUser, req, res);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  //! ---
  static async login(req, res) {
    const { email, password } = req.body;
    //validações
    if (!email) {
      res.status(422).json({ message: "O email é obrigatorio" });
      return;
    }
    if (!password) {
      res.status(422).json({ message: "A senha é obrigatoria" });
      return;
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      res
        .status(422)
        .json({ message: "Usuário não cadastrado com este e-mail" });
      return;
    }

    //discriptografia da senha e verificação se a senha esta correta
    // 1 - passar senha req comparar com a senha salva no db
    // 2 - user que foi puxado a senha foi aquele que foi verificado pelo email
    const checkPassword = await bcrypt.compare(password, user.password);

    // validando se senha salvada no banco é a mesma digitada na req lembrando que o bcrypt descriptografa antes de comparar
    if (!checkPassword) {
      res.status(422).json({ message: "Senha inválida" });
      return;
    }
    await createUserToken(user, req, res);
  }

  static async checkUser(req, res) {
    let currentUser;
    console.log(req.headers.authorization);
    if (req.headers.authorization) {
      const token = getToken(req);
      const decoded = jwt.verify(token, "nossosecret");

      currentUser = await User.findById(decoded.id);

      currentUser.password = undefined;
    } else {
      currentUser = null;
    }
    res.status(200).send(currentUser);
  }

  //!______________________________________________
  static async getUserById(req, res) {
    const id = req.params.id;

    const user = await User.findById(id).select("-password");

    if (!user) {
      res.status(422).json({ message: "Usuário não encontrado" });
      return;
    }
    res.status(200).json({ user });
  }

  static async editUser(req, res) {
    const id = req.params.id;

    const token = getToken(req);
    const user = await getUserByToken(token);
    const { name, email, phone, city, address, password, confirmpassword } =
      req.body;

    if (req.file) {
      user.image = req.file.filename;
    }
    //validations
    if (!name) {
      res.status(422).json({ message: "O nome é obrigatorio" });
      return;
    }
    user.name = name;
    if (!email) {
      res.status(422).json({ message: "O email é obrigatorio" });
      return;
    }

    // verificar se o usuario nao ta colocando um email que ja existe no sistema
    const userExists = await User.findOne({ email: email });
    if (user.email !== email && userExists) {
      res.status(422).json({
        message: "Por favor utilize outro e-mail",
      });
      return;
    }
    user.email = email;
    if (!phone) {
      res.status(422).json({ message: "O telefone  é obrigatorio" });
      return;
    }
    user.phone = phone;

    if (!city) {
      res.status(422).json({ message: "A cidade é obrigatoria" });
      return;
    } else {
      if (
        city === "Porto Alegre" ||
        city === "Viamao" ||
        city === "Canoas" ||
        city === "Gravatai" ||
        city === "Cachoeirinha" ||
        city === "Esteio"
      ) {
        user.city = city;
      } else {
        res.status(422).json({ message: "Selecione alguma cidade" });
        return;
      }
    }

    if (!address) {
      res.status(422).json({ message: "O endereço é obrigatorio" });
      return;
    }
    user.address = address;

    if (password != confirmpassword) {
      res.status(422).json({ message: "As senhas não conferem" });
      return;
    } else if (password == confirmpassword && password != null) {
      // creating password
      const salt = await bcrypt.genSalt(10);
      const reqPassword = req.body.password;

      const passwordHash = await bcrypt.hash(reqPassword, salt);

      user.password = passwordHash;
    }

    try {
      await User.findOneAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );
      res.status(200).json({
        message: "Usuario atualizado com sucesso!",
      });
    } catch (err) {
      res.status(500).json({ message: err });
      return;
    }

    console.log(user);
  }
};
