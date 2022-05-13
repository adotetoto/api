const User = require("../models/User");
const bcrypt = require("bcrypt");
const createUserToken = require("../helpers/create-token-user");
module.exports = class UserController {
  static async register(req, res) {
    const { name, email, phone, password, confirmpassword } = req.body;

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
};
