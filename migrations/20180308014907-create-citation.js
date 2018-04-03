'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('citations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      citation_id: {
        type: Sequelize.INTEGER
      },
      pmid: {
        type: Sequelize.INTEGER
      },
      doi: {
        type: Sequelize.STRING
      },
      other_source: {
        type: Sequelize.STRING
      },
      other_id: {
        type: Sequelize.INTEGER
      },
      citation: {
        type: Sequelize.TEXT
      },
      title: {
        type: Sequelize.STRING
      },
      author: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('citations');
  }
};
