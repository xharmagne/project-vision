import waitForPort from 'wait-for-port';
import config from '../config';

const options = {
  numRetries: 50, //Number of retries
  retryInterval: 200, //Milliseconds to wait between retries
};
console.log(
  `Waiting for ${config.database.host}:${config.database.port} to be up`
);
waitForPort(config.database.host, config.database.port, options, function(err) {
  if (err) {
    throw new Error(err);
  }
  console.log('Database is up');
});
