'use strict';
module.exports = (sequelize, DataTypes) => {
  var citation = sequelize.define('citation', {
    citation_id: DataTypes.INTEGER,
    pmid: DataTypes.INTEGER,
    doi: DataTypes.STRING,
    other_source: DataTypes.STRING,
    other_id: DataTypes.INTEGER,
    citation: DataTypes.TEXT,
    title: DataTypes.STRING,
    author: DataTypes.STRING,
    url: DataTypes.STRING
  }, {});
  citation.associate = function(models) {
    // associations can be defined here
  };
  return citation;
};
