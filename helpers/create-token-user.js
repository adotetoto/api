const jwt = require("jsonwebtoken");

const createUserToken = async (user, req, res) => {
  /*
    1 - importar o jwt
    2 - criar o token utilizando o metodo sign do jwt colocando as informações enviadas no token e passando um segredo
  */
  const token = jwt.sign(
    {
      name: user.name,
      id: user._id,
    },
    "nossosecret"
  );

  res.status(200).json({
    message: "Você está autenticado",
    token: token,
    userId: user._id,
  });
};

module.exports = createUserToken;
