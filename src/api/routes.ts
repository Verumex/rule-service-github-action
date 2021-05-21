import * as core from "@actions/core";

const baseUrl = core.getInput("api_host");
const ruleServiceId = core.getInput("rule_service_id");

export const createExecution = (): string =>
  `${baseUrl}/api/v1/data_pipelines/business_rule_services/${ruleServiceId}/executions`;

export const getExecution = (executionId: string): string =>
  `${baseUrl}/api/v1/data_pipelines/business_rule_services/${ruleServiceId}/executions/${executionId}`;

export const getResults = (executionId: string): string => {
  const query = `data_pipelines_business_rule_services_executions_results_search_form[execution_id]=${executionId}`;
  return `${baseUrl}/api/v1/data_pipelines/business_rule_service_results?${query}`;
};
