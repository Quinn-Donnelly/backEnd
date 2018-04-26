const express = require('express');
const router = express.Router();
const jsonResponse = require('../utils/response');
const Helper = require('../helpers/helper');
const fs = require('fs');
const path = require('path');
const shortid = require('shortid');
const zip = new require('node-zip')();

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

/**
 * Constructs a file into the temp directory this file will have a csv format
 * with the contents of obj in side of it the fields will be the keys
 * @param  {Object} obj  This is the object that holds the data to be put in the
 *                       file
 * @param  {STRING} name This is the name of the file (be sure it's unique)
 * @return {Promise}      Will resolve when done (doesn't reject currently)
 */
buildFile = (obj, name) => {
  return new Promise(async (resolve, reject) => {
    const output = fs.createWriteStream(`temp/${name}`, {encoding: 'utf8'});
    const keys = Object.keys(obj[0].dataValues);
    for (let i = 0; i < keys.length; i += 1) {
      if (i+1 === keys.length) {
        output.write(`${keys[i]}\n`);
      } else {
        output.write(`${keys[i]}, `);
      }
    }

    let needQuote = false;
    for (let i = 0; i < obj.length; i += 1) {
      for (let j = 0; j < keys.length; j += 1) {
        needQuote = false;
        if (typeof(obj[i].dataValues[keys[j]]) === 'string') {
          obj[i].dataValues[keys[j]] = obj[i].dataValues[keys[j]]
                                      .replace(/\r?\n|\r/g, '\\n');
          if (obj[i].dataValues[keys[j]].search(',') !== -1) {
            output.write('\"');
            needQuote = true;
          }
        }

        if (j+1 === keys.length) {
          output.write(`${obj[i].dataValues[keys[j]]}\n`);
        } else {
          output.write(`${obj[i].dataValues[keys[j]]}`);
        }

        if (needQuote) {
          output.write('\"');
        }

        if (j+1 !== keys.length) {
          output.write(',');
        }
      }
    }
    output.end();
    output.on('close', () => {
      resolve();
    });
  });
};

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

    if (req.query.file) {
      const targetFileName = `target-${shortid.generate()}.csv`;
      const chemicalFileName = `chemical-${shortid.generate()}.csv`;

      const fileConstruction = [];
      fileConstruction.push(buildFile(result['target'], targetFileName));
      fileConstruction.push(buildFile(result['chemical'], chemicalFileName));

      await Promise.all(fileConstruction);

      zip.file('target.csv', fs.readFileSync(
        path.join(__dirname, '../temp', targetFileName)
      ));
      zip.file('chemical.csv', fs.readFileSync(
        path.join(__dirname, '../temp', chemicalFileName)
      ));

      let data = zip.generate({base64: false, compression: 'DEFLATE'});

      const zipFileName = `zip-${shortid.generate()}.zip`;
      fs.writeFileSync(
        path.join(__dirname, '../temp', zipFileName),
        data,
        'binary'
      );
      res.download(
        path.join(__dirname, '../temp', zipFileName),
        `results.zip`,
        (err) => {
          if (err) console.log(err);
          fs.unlink(path.join(__dirname, '../temp', zipFileName), (err) => {
            console.log(
              'Error in basic query file zip delete',
              err
            );
          });
          fs.unlink(path.join(__dirname, '../temp', chemicalFileName),
            (err) => {
              console.log(
                'Error in basic query file chemical delete',
                err
              );
            }
          );
          fs.unlink(path.join(__dirname, '../temp', targetFileName), (err) => {
            if (err) {
              console.log(
                'Error in basic query file target delete',
                err
              );
            }
          });
        }
      );

      return;
    }

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

    let limit;
    let offset;
    try {
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

    const helper = new Helper(
      modelName,
      [],
      limit
    );

    let results;
    try {
      results = await helper.advancedSearch(params, {limit, offset});
    } catch (err) {
      res.status(500).josn(new jsonResponse(err));
      return;
    }

    // If the user specified they want a file send results in file
    if (req.query.file) {
      const fileName = `${modelName}-${shortid.generate()}.csv`;
      await buildFile(results, fileName);
      res.download(
        path.join(__dirname, '../temp', fileName),
        `${modelName}.csv`,
        (err) => {
          console.log(
            'Error in advanced query download csv',
            err
          );
          fs.unlink(path.join(__dirname, '../temp', fileName), (err) => {
            console.log(
              'Error in advanced query file delete',
              err
            );
          });
        });
      return;
    }

    res.status(200).json(new jsonResponse(null, results));
  });

module.exports = router;
