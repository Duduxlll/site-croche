const bcrypt = require("bcrypt");

const senhaOriginal = "123crocheadmin"; // você pode trocar por sua senha desejada

bcrypt.hash(senhaOriginal, 10).then(hash => {
  console.log("Hash gerado:");
  console.log(hash);
});
