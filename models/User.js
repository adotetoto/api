const db = require("../db/conn");

const { Schema } = db;

const User = db.model(
  "User",
  new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
      image: {
        type: String,
      },
      phone: {
        type: String,
        required: true,
      },
      //!modificado
      city: {
        type: String,
        required: true,
      },
      //! modificado
      address: {
        type: String,
        required: true,
      },
    },
    { timestamps: true }
  )
);
module.exports = User;
