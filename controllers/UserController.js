const User = require("../models/User");
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
    const userExists = User.findOne({ email: email });
    if (userExists) {
      res
        .status(422)
        .json({ message: "Email já utilizado,por favor informe outro e-mail" });
      return;
    }
  }
};
