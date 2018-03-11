const express = require('express');
const router = express.Router();
const experiment = require('../models').experiment;
const jsonResponse = require('../utils/response');

// TODO: Write the tests for the expirement routes

// Limit default on queries
const DEFAULT_RETURN_LIMIT = 25;

/**
 * This will define the routes to be preformed on the  experiment model
 *
 * path = /
 * @func GET
 * Returns an array of elements that match the query supplied
 * @param {int} limit Supply a limit param in the query to change the default
 *                    limit on a query
 * @param {any} query Anything in the query that is not limit will be passed as
 *                    where parameters
 *
 * @func POST
 * Adds a element to the database with the options supplied that match the model
 * @param {any} body Anything in the body will seed the model for create
 *                   (any options that are not defined in the model will not be
 *                   added)
 *
 * path = /:id
 * @func GET
 * Returns the object matching the prymaryKey given
 * @func DELETE
 * Removes the element that had matching prymaryKey to id in routing param
 */
router.route('/')
  .get(async (req, res) => {
    let limit = DEFAULT_RETURN_LIMIT;
    let queryOptions = {};

    if (req.query !== undefined) {
      queryOptions = req.query;
      if (req.query.limit !== undefined) {
        try {
          limit = parseInt(req.query.limit);
          if (isNaN(limit)) {
            throw (new Error('Limit must be an int'));
          }
          delete queryOptions.limit;
        } catch (err) {
          res.status(400).json(new jsonResponse(`Error in query: ${err}`));
          return;
        }
      }
    }

    let results;
    try {
      results = await experiment.findAll({limit, where: queryOptions});
    } catch (err) {
      res.status(500).json(new jsonResponse(`Error in query: ${err}`));
      return;
    }

    res.status(200).json(new jsonResponse(null, results));
  })
  .post(async (req, res) => {
    let writeResult;
    try {
      const options = Object.assign({}, req.body);
      writeResult = await experiment.build(options).save();
    } catch (err) {
      res.status(500).json(new jsonResponse(err));
      return;
    }

    res.status(201)
      .location(`/experiment/${writeResult.dataValues.id}`)
      .json(new jsonResponse(null, writeResult.dataValues));
  });

  router.route('/:id')
    .get((req, res) => {
      req.query.id = req.params.id;
      findOne(req, res);
    })
    .delete(async (req, res) => {
      let instance;
      const id = parseInt(req.params.id);
      try {
        instance = await experiment.findById(id);
      } catch (err) {
        res.status(500)
           .json(new jsonResponse(`error loading instance, ${err}`));
        return;
      }

      if (instance === null) {
        res.status(404).json(new jsonResponse('Instance not found'));
        return;
      }

      try {
        await instance.destroy();
      } catch (err) {
        res.status(500).json(new jsonResponse('Error destroying instance'));
        return;
      }

      res.status(200).json(new jsonResponse(null, `id=${id} has been deleted`));
    });

/**
 * This will find one instanse of the  experiment model with matching prymaryKey
 * @param {Object} req This is the request object for express
 * @param  {int} req.query.id The prymaryKey for the model to query
 * @param  {Object} res Response object for express
 */
async function findOne(req, res) {
 if (req.query === undefined || req.query.id === undefined) {
   res.status(400).json(new jsonResponse('expected id to be defined'));
   return;
 }

 try {
   const id = String(req.query.id);
   const selection = await experiment.findById(id);
   if (selection === null) {
     res.status(404).json(new jsonResponse(`Entry with id=${id} not found`));
     return;
   }

   res.status(200).json(new jsonResponse(null, selection.dataValues));
   return;
 } catch (err) {
   res.status(500).json(new jsonResponse(err));
   return;
 }
}

module.exports = router;
