'use strict';
const data = require('../csvData/chemical.seeddata');

module.exports = {
  up: (queryInterface, Sequelize) => {
    for(let i = 0; i < data.length; i+=1)
    {
      data[i]['createdAt'] = new Date();
      data[i]['updatedAt'] = new Date();
    }
    return queryInterface.bulkInsert('chemicals', data, {});
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('chemicals', null, {});
  }
};
