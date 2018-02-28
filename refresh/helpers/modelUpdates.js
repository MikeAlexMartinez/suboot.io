'use strict';

module.exports = {
  manageModelUpdate,
  checkAndCreateTable,
};

/**
 * Abstract the model update process to make process chainable
 * @param {object} db
 * @param {*} model
 * @param {*} modelDef
 * @param {*} Model
 * @param {*} fn
 * @param {*} data
 * @return {promise}
 */
function manageModelUpdate(db, model, modelDef, Model, fn, data) {
  return new Promise((res, rej) => {
    checkAndCreateTable(db, model, modelDef, Model)
      .then(() => {
        // console.log(obj);
        // Now that the table exists we can insert items using function
        // models and data provided.
        return fn(data[model], Model);
      })
      .then(({updates, errors, noChange, news}) => {
        const log = {
          name: model,
          results: [
            `!! => ${news.length} items were created. <= !!`,
            `!! => ${updates.length} items were updated. <= !!`,
            `!! => ${noChange.length} items did not change. <= !!`,
            `!! => ${errors.length} Errors Encountered! <= !!`],
        };

        res(log);
      })
      .catch((err) => {
        console.error(err);
        rej(err);
      });
  });
}

/**
 * Check if table exists, create if not
 * @param {object} db
 * @param {*} model
 * @param {*} modelDef
 * @param {*} Model
 * @return {promise}
 */
function checkAndCreateTable(db, model, modelDef, Model) {
  return new Promise((res, rej) => {
    if (!db.isDefined(model)) {
      rej(new Error(model + ' is NOT defined!'));
    } else {
      db.query(
          `SELECT EXISTS (
            SELECT 1 
            FROM   pg_catalog.pg_class c
            JOIN   pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE  n.nspname = 'public'
            AND    c.relname = '${model}'
            AND    c.relkind = 'r'    -- only tables ...(?)
          );`
        )
        .spread((results) => {
          // if rowCount greater than 0 table exists
          if ( results[0].exists ) {
            res({
              message: '=> Model defined, table already exists! <=',
              status: true,
            });
          } else {
            return createTable();
          }
        })
        .then((obj) => {
          res(obj);
        })
        .catch((err) => {
          console.error(err);
          rej(err);
        });
    }
  });

  /**
   * Create Table if it doesn't exist
   * @return {promise}
   */
  function createTable() {
    return new Promise((res, rej) => {
      db.getQueryInterface()
        .createTable(
          model,
          modelDef,
          {
            engine: 'postgres',
            charset: 'utf-8',
            schema: 'public',
          },
          Model
        ).
        then(() => {
          res({
            message: '=> Model defined, table Created! <=',
            status: true,
          });
        })
        .catch((err) => {
          console.error(err);
          rej(err);
        });
    });
  }
}
