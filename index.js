/* eslint import/prefer-default-export: 0 */
import { graphql } from 'graphql';
import schema from './schema';

function handler(event, context, callback) {
  graphql(schema, event.query).then((data) => {
    callback(null, data);
  }, (err) => {
    callback(err);
  });
}

export { handler };
