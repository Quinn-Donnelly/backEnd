'use strict';
const data = require('../csvData/target_v2.seeddata');

module.exports = {
  up: (queryInterface, Sequelize) => {
    for(let i = 0; i < data.length; i+=1)
    {
      data[i]['createdAt'] = new Date();
      data[i]['updatedAt'] = new Date();
    }
    return queryInterface.bulkInsert('targets', data, {});
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('targets', null, {});
  }
};
