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
const SUPPORTED_MODELS = [
  'target',
  'chemical',
];

router.route('/')
  .get(async (req, res) => {
    let modelName = (req.query.name) ? req.query.name : null;
    if (modelName == null) {
      res.status(400).json(new jsonResponse('A model name must be specified'));
      return;
    }

    if (!SUPPORTED_MODELS.includes(modelName)) {
      res.status(400).json(
        new jsonResponse(
          `The ${modelName} is not supported in the detail API`
        )
      );
      return;
    }

    let helper;
    if (modelName == 'chemical') {
      helper = new Helper(
        'chemical',
        CHEMICAL_FIELDS,
        DEFAULT_RETURN_LIMIT
      );
    } else if (modelName == 'target') {
      helper = new Helper(
        'target',
        TARGET_FIELDS,
        DEFAULT_RETURN_LIMIT
      );
    }

    const details = helper.getAttributeList();
    res.status(200).json(new jsonResponse(null, details));
  });

module.exports = router;
