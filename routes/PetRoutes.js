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
router.patch("/schedule/:id", verifytoken, PetController.schedule);
router.patch("/conclude/:id", verifytoken, PetController.concludeAdoption);

//filtros

//all
router.get("/filters/all", PetController.getAll);
//sexo
router.get("/filters/macho", PetController.getSexMale);
router.get("/filters/femea", PetController.getSexFemale);
//cidade
router.get("/filters/portoalegre", PetController.getCityPortoAlegre);
router.get("/filters/viamao", PetController.getCityViamao);
router.get("/filters/canoas", PetController.getCityCanoas);
router.get("/filters/gravatai", PetController.getCityGravatai);
router.get("/filters/cachoeirinha", PetController.getCityCachoeirinha);
router.get("/filters/esteio", PetController.getCityEsteio);
//porte
router.get("/filters/small", PetController.getSizeSmall);
router.get("/filters/medium", PetController.getSizeMedium);
router.get("/filters/great", PetController.getSizeGreat);

module.exports = router;
