const bcrypt = require("bcrypt");

const senhaOriginal = "@@admincroche068895"; // você pode trocar por sua senha desejada

bcrypt.hash(senhaOriginal, 10).then(hash => {
  console.log("Hash gerado:");
  console.log(hash);
});
