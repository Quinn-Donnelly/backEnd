const express = require('express');
const router = express.Router();
const target = require('../models').target;
const jsonResponse = require('../utils/response');

// Limit default on queries
const DEFAULT_RETURN_LIMIT = 25;

/**
 * This will define the routes to be preformed on the  target model
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
 * @func PUT
 * This is not allowed by any user and will return with a status of 405
 *
 * @func PATCH
 * This is not allowed by any user and will return with a status of 405
 *
 * @func DELETE
 * This is not allowed by any user and will return with a status of 405
 *
 * path = /:id
 * @func GET
 *  Returns the object matching the prymaryKey given
 * @func POST
 *  Returns if there is a conflicting resource (409)
 *  Or if there is no resource matching the id (404)
 * @func PUT
 *  Replaces the existing resource with given attributes from the body of the
 *  request. Any non spedified attributes will be the models default values
 *  (null if none are set)
 * @func PATCH
 *  Will update any fields specified in body leaving any fields that are not
 *  specified in body in their current state.
 * @func DELETE
 *  Removes the element that had matching prymaryKey to id in routing param
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
            res.status(400).json(
              new jsonResponse('id was Nan, Expected integer')
            );
            return;
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
      results = await target.findAll({limit, where: queryOptions});
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
      writeResult = await target.build(options).save();
    } catch (err) {
      res.status(500).json(new jsonResponse(err));
      return;
    }

    res.status(201)
      .location(`/target/${writeResult.dataValues.id}`)
      .json(new jsonResponse(null, writeResult.dataValues));
  })
  .put(async (req, res) => {
    res.status(405).json(
      new jsonResponse(
        'Replacing / Updating an entire collection is not allowed'
      )
    );
  })
  .patch(async (req, res) => {
    res.status(405).json(
      new jsonResponse(
        'Updating / Modifying the entrie collection is not allowed'
      )
    );
  })
  .delete(async (req, res) => {
    res.status(405).json(
      new jsonResponse('Deleting this collection is not allowed')
    );
  });

  router.route('/:id')
    .get((req, res) => {
      req.query.id = req.params.id;
      findOne(req, res);
    })
    .post(async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          res.status(400).json(
            new jsonResponse('id was Nan, Expected integer')
          );
          return;
        }
        const resource = await target.findById(id);
        if (resource === null) {
          res.status(404).json(new jsonResponse('resource not found'));
          return;
        }

        res.status(409).json(new jsonResponse('conflicting resource found'));
      } catch (err) {
        res.status(500).json(new jsonResponse(err));
      }
    })
    .put(async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          res.status(400).json(
            new jsonResponse('id was Nan, Expected integer')
          );
          return;
        }
        let resource = await target.findById(id);
        if (resource === null) {
          res.status(404).json(new jsonResponse('resource not found'));
          return;
        }

        let updatedResource = Object.assign({}, resource.dataValues);
        delete updatedResource.id;
        delete updatedResource.createdAt;
        delete updatedResource.updatedAt;

        Object.keys(updatedResource).forEach((key) => {
          if (req.body[key] !== undefined) {
            updatedResource[key] = req.body[key];
          } else {
            updatedResource[key] = null;
          }
        });

        const writeResult = await resource.update(updatedResource);
        res.status(200).json(new jsonResponse(null, writeResult.dataValues));
        return;
      } catch (err) {
        res.status(500).json(new jsonResponse(err));
      }
    })
    .patch(async (req, res) => {
      let id;
      try {
        id = parseInt(req.params.id);
        if (isNaN(id)) {
          res.status(400).json(
            new jsonResponse('id was Nan, Expected integer')
          );
          return;
        }
      } catch (err) {
        res.status(400).json(new jsonResponse('Id expected to be integer.'));
        return;
      }

      try {
        let instance = await target.findById(id);
        if (instance === null) {
          res.status(404).json(new jsonResponse('resource not found'));
          return;
        }

        const writeResult = await instance.update(req.body);
        res.status(200).json(new jsonResponse(null, writeResult.dataValues));
      } catch (err) {
        return;
        res.status(500).json(new jsonResponse(
          `Error updating database: ${err}`
        ));
        return;
      }
    })
    .delete(async (req, res) => {
      let instance;
      let id;
      try {
        id = parseInt(req.params.id);
        if (isNaN(id)) {
          res.status(400).json(
            new jsonResponse('id was Nan, Expected integer')
          );
          return;
        }
        instance = await target.findById(id);
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
 * This will find one instanse of the  target model with matching prymaryKey
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
   const selection = await target.findById(id);
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
