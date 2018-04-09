const models = require('../models');
const Op = models.Sequelize.Op;
const chemical = models.chemical;

/**
 * Class helper for the chemical model that can preform the following
 */
class ChemicalHelper {
  /**
   * Sets constants for the model helper
   */
  constructor() {
    this.defaultFields = [
      'Substance_Name',
      'Substance_CASRN',
      'Structure_SMILES',
      'Structure_InChI',
      'Structure_Formula',
      'Structure_MolWt',
    ];
    this.defaultLimit = 25;
  }

  /**
   * Queries using default options
   * @param  {STRING}  queryString The usrs input non spesific database
   * @param  {Object}  options This will set the options for the query
   *                           (Optional)
   * @param  {integer}  options.limit      How many docs to Returns
   * @param  {integer}  options.offset     Where to begin the query
   *                                     (allow user to get next if using limit)
   * @return {Promise}             Will return error or an array with results
   *                               of query
   */
  async basicQuery(queryString, options) {
    return new Promise(async (resolve, reject) => {
      let limit = this.defaultLimit;
      if (options && options.limit !== undefined && options.limit !== null) {
        limit = options.limit;
      }

      let searchParams = [];
      for (let i = 0; i < this.defaultFields.length; i += 1) {
        searchParams.push({
          [this.defaultFields[i]]: {
            [Op.like]: `%${queryString}%`,
          },
        });
      }

      console.log(searchParams);

      const results = await chemical.findAll(
        {
          attributes: this.defaultFields,
          limit,
          where: {
            [Op.or]: searchParams,
          },
        }
      );
      resolve(results);
    });
  }
}

module.exports = ChemicalHelper;
