import { DynamoDB } from 'aws-sdk';

function constructParams(tableName, fields = {}) {
  const keys = Object.keys(fields);

  if (keys.length === 0) {
    return {
      TableName: tableName,
    };
  }

  const filters = keys.reduce((memo, key) => [...memo, `#${key} = :${key}`], []);
  const attributeNames = keys.reduce((memo, key) => Object.assign(memo, {
    [`#${key}`]: key,
  }), {});
  const attributeValues = keys.reduce((memo, key) => Object.assign(memo, {
    [`:${key}`]: fields[key],
  }), {});

  return {
    TableName: tableName,
    FilterExpression: filters.join(' AND '),
    ExpressionAttributeNames: attributeNames,
    ExpressionAttributeValues: attributeValues,
  };
}

function query(tableName, fields = {}) {
  const docClient = new DynamoDB.DocumentClient({ region: 'ap-southeast-2' });
  const params = constructParams(tableName, fields);

  return new Promise((resolve, reject) => {
    docClient.scan(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Items);
      }
    });
  });
}

export default query;
