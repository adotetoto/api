const jwt = require("jsonwebtoken");
const getToken = require("./get-token");

const checkToken = (req, res, next) => {
  // tem que ter uma verificação antes do token chegar,caso contrario vai ocasioar um erro
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Acesso negado" });
  }
  const token = getToken(req);

  // nao tem token acesso negado
  if (!token) {
    return res.status(401).json({ message: "Acesso negado" });
  }
  try {
    const verified = jwt.verify(token, "nossosecret");
    req.user = verified;
    next();
  } catch (error) {
    return res.status(400).json({ message: "Token invalido" });
  }
};

module.exports = checkToken;
