import express from 'express';
import { ObjectID } from 'mongodb';
import { validate } from 'express-jsonschema';
import FilmCategorySchema from '../schemas/FilmCategorySchema';

const router = express.Router();

const initializeRouter = db => {
  router.get('/', (req, res, next) => {
    db.collection('film-categories')
      .find(
        {},
        {
          id: '$_id',
          _id: 0,
          title: 1,
          description: 1,
          films: 1,
        }
      )
      .toArray((err, doc) => {
        if (err) throw err;
        res.send(doc);
      });
  });

  router.post('/', validate({ body: FilmCategorySchema }), (req, res, next) => {
    db.collection('film-categories').insertOne(req.body, (err, doc) => {
      if (err) throw err;
      const category = doc.ops[0];
      category.id = category._id;
      delete category._id;
      res.send(category);
    });
  });

  router.put('/:id', validate({ body: FilmCategorySchema }), (req, res, next) => {
    db.collection('film-categories').findOneAndUpdate(
      { _id: ObjectID(req.params.id) },
      { $set: req.body },
      { returnOriginal: false },
      (err, doc) => {
        if (err) throw err;
        doc.value ? res.send(doc.value) : res.status(404).json({ error: "requested id doesn't match category object" });
      }
    );
  });

  router.delete('/:id', (req, res, next) => {
    db.collection('film-categories').deleteOne(
      {
        _id: ObjectID(req.params.id),
      },
      (err, doc) => {
        if (err) throw err;
        if (doc.deletedCount) {
          res.json({
            success: true,
            id: req.params.id,
          });
        } else {
          res.status(404).json({
            success: false,
          });
        }
      }
    );
  });

  router.use((err, req, res, next) => {
    if (err.name === 'JsonSchemaValidation') {
      const errors = {};
      err.validations.body.map(object => (errors[object.property] = object.messages[0]));
      res.status(400).send(errors);
    } else {
      next(err);
    }
  });

  return router;
};

export default initializeRouter;