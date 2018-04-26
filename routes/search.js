const express = require('express');
const router = express.Router();
const jsonResponse = require('../utils/response');
const Helper = require('../helpers/helper');

// Limit default on queries
const DEFAULT_RETURN_LIMIT = 25;
const CHEMICAL_FIELDS = [
  'Substance_Name',
  'Substance_CASRN',
  'Structure_SMILES',
  'Structure_InChI',
  'Structure_Formula',
  'Structure_MolWt',
];
const TARGET_FIELDS = [
  'intended_target_official_full_name',
  'intended_target_gene_name',
  'intended_target_official_symbol',
  'intended_target_gene_symbol',
  'technological_target_official_full_name',
  'technological_target_gene_name',
  'technological_target_official_symbol',
  'technological_target_gene_symbol',
];

router.route('/basic')
  .get(async (req, res) => {
    let query;
    let limit;
    let offset;
    try {
      if (req.query && req.query.q) {
        query = req.query.q;
      } else {
        res.status(400).json(new jsonResponse('Must specify a query'));
      }

      if (req.query && req.query.limit && !isNaN(parseInt(req.query.limit))) {
        limit = parseInt(req.query.limit);
      } else {
        limit = DEFAULT_RETURN_LIMIT;
      }

      if (req.query && req.query.offset && !isNaN(parseInt(req.query.offset))) {
        offset = parseInt(req.query.offset);
      } else {
        offset = 0;
      }
    } catch (err) {
      res.status(400).json(new jsonResponse(err));
    }


    const chemicalHelper = new Helper(
      'chemical',
      CHEMICAL_FIELDS,
      limit
    );
    const targetHelper = new Helper(
      'target',
      TARGET_FIELDS,
      limit
    );

    const chemResult = chemicalHelper.basicQuery(query, {offset});
    const targetResult = targetHelper.basicQuery(query, {offset});

    const data = await Promise.all([chemResult, targetResult]);
    const result = {
      chemical: data[0],
      target: data[1],
    };

    res.status(200).json(new jsonResponse(null, result));
  });

router.route('/advanced/:model')
  .get(async (req, res) => {
    const modelName = (req.params.model) ? req.params.model : null;
    if (!modelName) {
      res.status(400).josn(new jsonResponse(
        'Model must be specified in the advanced search'
      ));
      return;
    }

    const query = (req.query.q) ? req.query.q : null;
    if (!query) {
      res.status(400).json(new jsonResponse(
        'The q string must be set with the advanced query options'
      ));
      return;
    }

    let params;
    try {
      params = JSON.parse(query);
    } catch (err) {
      res.status(500).json(new jsonResponse(
        `Unable to convert q from JSON: ${err}`
      ));
      return;
    }

    // TODO: set up offset and limit
    const helper = new Helper(
      modelName,
      [],
      DEFAULT_RETURN_LIMIT
    );

    const results = await helper.advancedSearch(params);
    res.status(200).json(new jsonResponse(null, results));
  });
module.exports = router;
