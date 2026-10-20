const User = require('./models/userModel');

const insertInitialUserData = async () => {

  const userData = [ 
    // Inserta los datos de usuario aquí si es necesario
  ];

  // Insertar datos con opción ignoreDuplicates
  // Para actualizar todas las filas: updateOnDuplicate: Object.keys(User.rawAttributes)
  await User.bulkCreate(userData, { ignoreDuplicates: true });
};

module.exports = { insertInitialUserData };

