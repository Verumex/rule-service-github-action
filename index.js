const core = require('@actions/core');
const wait = require('./wait');
const axios = require('axios');

axios.defaults.baseURL = core.getInput('api_host')
axios.defaults.headers.common['Authorization'] =
  `Bearer ${core.getInput('auth_token')}`
const ruleServiceId = core.getInput('rule_service_id')
let pollAttempts = 0
const maxPollAttempts = 20
const pollInterval = 2000 // milliseconds

async function initiateExecution() {
  try {
    const response = await axios.post(
      `/api/v1/data_pipelines/business_rule_services/${ruleServiceId}/executions`, {
        validation_scope: core.getInput('validation_scope'),
        severity_level_threshold_to_trigger_failure: 5
      }
    );
    return response.data.id;
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function getResults(executionId) {
  try {
    const resultsEndpoint = `/api/v1/data_pipelines/business_rule_service_results?data_pipelines_business_rule_services_executions_results_search_form%5Bexecution_id%5D=${executionId}`
    const response = await axios.get(resultsEndpoint)
    const executionData = response.data.included.find(obj => {
      return obj.type === 'execution'
    })
    // NOTE: The executionState will be "initiated", "completed" or "failed".
    if(executionData.attributes.executionState !== 'initiated') {
      // TODO: Get all results not just first page.
      return [executionData, response.data.data]
    }
    pollAttempts += 1
    if (pollAttempts == maxPollAttempts) {
      throw 'Execution timed out (max poll attempts reached).'
    }
    console.log("Polling for execution completion...")

    await wait(pollInterval)
    return await getResults(executionId)
  } catch (error) {
    core.setFailed(error.message || error);
  }
}

async function run() {
  try {
    const executionId = await initiateExecution();
    const [execution, results] = await getResults(executionId);
    results.forEach(function (result) {
      let attributes = result.attributes;
      core.info(`${attributes.ruleSignature}: ${attributes.message} (${attributes.severityLevel})`);
    });

    if(execution.attributes.executionState === 'failed') {
      core.setFailed('Rule execution failed.')
    }

    // NOTE: Just leaving setOutput here for reference in case we want to use it
    // later. See // https://github.com/actions/toolkit/blob/main/docs/commands.md#set-outputs
    // core.setOutput('my_output', 'output value');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
