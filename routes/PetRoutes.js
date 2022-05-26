const router = require("express").Router();
const PetController = require("../controllers/PetController");

//? VERIFICAÇÃO DE AUTENTICAÇÃO
const verifytoken = require("../helpers/verify-token");
const { imageUpload } = require("../helpers/image-upload");
router.post(
  "/create",
  verifytoken,
  imageUpload.array("images"),
  PetController.create
);

router.get("/", PetController.getAll);

module.exports = router;
