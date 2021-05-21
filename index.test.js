const wait = require('./wait');
const process = require('process');
const cp = require('child_process');
const path = require('path');

test('sample throw expectation', async () => {
  await expect(wait('foo')).rejects.toThrow('milliseconds not a number');
});

test('sample async', async () => {
  const start = new Date();
  await wait(500);
  const end = new Date();
  var delta = Math.abs(end - start);
  expect(delta).toBeGreaterThanOrEqual(500);
});

// shows how the runner will run a javascript action with env / stdout protocol
test('test run', () => {
  process.env['INPUT_API_HOST'] = 'SET ME';
  process.env['INPUT_AUTH_TOKEN'] = 'SET ME';
  process.env['INPUT_RULE_SERVICE_ID'] = 'SET ME';
  process.env['INPUT_VALIDATION_SCOPE'] = 'SET ME';
  const ip = path.join(__dirname, 'index.js');
  console.log(cp.execSync(`node ${ip}`, {env: process.env}).toString());
})
