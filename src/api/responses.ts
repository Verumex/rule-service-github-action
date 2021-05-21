interface Record {
  id: string;
  type: string;
  attributes: {};
}

export type ExecutionState = "initiated" | "completed" | "failed";

interface Execution extends Record {
  type: "execution";
  attributes: {
    executionState: ExecutionState;
    validationScope: string[];
  };
}

export interface Result extends Record {
  type: "result";
  attributes: {
    message: string;
    ruleSignature: string;
    severityLevel: number;
    tags: string[];
  };
}

interface BusinessRuleService extends Record {
  type: "businessRuleService";
}

export interface CreateExecutionResponse {
  data: Execution;
}

export type GetExecutionResponse = CreateExecutionResponse;

export interface GetResultsResponse {
  data: Result[];
  included: (BusinessRuleService | Execution)[];
}
