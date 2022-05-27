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
router.get("/mypets", verifytoken, PetController.getAllUserPets);
router.get("/myadoptions", verifytoken, PetController.getAllUserAdoptions);
router.get("/:id", PetController.getPetById);
router.delete("/:id", verifytoken, PetController.removePetById);
router.patch(
  "/:id",
  verifytoken,
  imageUpload.array("images"),
  PetController.updatePet
);

module.exports = router;
