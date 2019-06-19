import express from 'express';
import { ObjectID } from 'mongodb';
import { validate } from 'express-jsonschema';
import FilmSchema from '../jsonSchemas/filmSchema';
import Film from '../models/film';

import categoriesRouterInitializer from './filmCategories';

const router = express.Router();

const initializeRouter = () => {
  router.get('/', (req, res, next) => {
    const query = req.query.category ? { category: req.query.category } : {};

    console.log('GET handling');

    Film.find(
      query,
      {
        id: '$_id',
        _id: 0,
        title: 1,
        description: 1,
        avatar: 1,
        gallery: 1,
        rating: 1,
        category: 1,
      },
      { $limit: 10 },
      (err, docs) => {
        if (err) throw err;
        res.send(docs);
      }
    );

    /*db.collection('films')
      .find(query, {
        id: '$_id',
        _id: 0,
        title: 1,
        description: 1,
        avatar: 1,
        gallery: 1,
        rating: 1,
        category: 1,
      })
      .limit(10)
      .toArray((err, doc) => {
        if (err) throw err;
        res.send(doc);
      });*/
  });

  router.post('/', validate({ body: FilmSchema }), (req, res, next) => {

    console.log('POST handling');

    Film.create(req.body, (err, doc) => {
      if (err) throw err;
      const film = doc.ops[0];
      film.id = film._id;
      delete film._id;
      res.send(film);
    });

    /*db.collection('films').insertOne(req.body, (err, doc) => {
      if (err) throw err;
      const film = doc.ops[0];
      film.id = film._id;
      delete film._id;
      res.send(film);
    });*/
  });

  /*router.put('/:id', validate({ body: FilmSchema }), (req, res, next) => {
    db.collection('films').findOneAndUpdate(
      { _id: ObjectID(req.params.id) },
      { $set: req.body },
      { returnOriginal: false },
      (err, doc) => {
        if (err) throw err;
        doc.value ? res.send(doc.value) : res.status(404).json({ error: "requested id doesn't match category object" });
      }
    );
  });*/

  /*router.delete('/:id', (req, res, next) => {
    db.collection('films').deleteOne(
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
  });*/

  router.use('/categories', categoriesRouterInitializer);

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
