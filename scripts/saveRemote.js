import { DynamoDB } from 'aws-sdk';
import { each } from 'async';

function saveRemote(data, callback) {
  const docClient = new DynamoDB.DocumentClient({ region: 'ap-southeast-2' });

  each(data, (item, cb) => {
    docClient.put({
      TableName: 'elections',
      Item: item,
    }, cb);
  }, callback);
}

export default saveRemote;
