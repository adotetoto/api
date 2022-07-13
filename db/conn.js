const mongoose = require("mongoose");
/*
  ? MONGODB ATLAS
 "mongodb+srv://adoteototo:33119525@cluster0.kndjb64.mongodb.net/?retryWrites=true&w=majority"

 ? MONGODB LOCAL
 "mongodb://localhost:27017/adoteototo"
 */
async function main() {
  await mongoose.connect("mongodb://localhost:27017/adoteototo");
  console.log("Conectou ao mongoose!");
}

main().catch((err) => console.log(err));

module.exports = mongoose;
