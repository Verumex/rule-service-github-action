import * as core from "@actions/core";
import fetch from "node-fetch";

import { GetResultsResponse, GetExecutionResponse } from "./responses";
import type { ExecutionState, Result } from "./responses";
import { wait } from "../wait";
import { fetchOptions } from "./utils";
import * as Routes from "./routes";

let pollAttemptsCount = 0;
const maxPollAttemptsCount = 20;
const pollInterval = 2000; // milliseconds

interface ExecutionResults {
  executionState: ExecutionState;
  results: Result[];
}

/**
 * Get results for the given execution.
 * @param executionId Execution ID we're fetching results for.
 * @returns Promise object that is resolved with ExecutionResults object
 * (or undefined if we failed to return results for whatever reason).
 */
export const getResults = async (
  executionId: string,
): Promise<ExecutionResults | undefined> => {
  try {
    pollAttemptsCount += 1;

    /**
     * An execution should always succeed or fail in a timely manner. However,
     * we might end up with an execution stuck in an initiated state in case of
     * a server error. This guard ensures the action will time out accordingly.
     */
    if (pollAttemptsCount > maxPollAttemptsCount) {
      throw new Error(
        "Execution timed out with no results (max poll attempts reached).",
      );
    }

    core.info(
      `Fetching results for execution ID ${executionId} ... attempt #${pollAttemptsCount}`,
    );

    const executionResponse = await fetch(
      Routes.getExecution(executionId),
      fetchOptions(),
    );
    const executionJson: GetExecutionResponse = await executionResponse.json();

    const { executionState } = executionJson.data.attributes;
    if (executionState === "initiated") {
      core.info("Polling for execution completion...");

      await wait(pollInterval);

      return getResults(executionId);
    }

    const resultsResponse = await fetch(
      Routes.getResults(executionId),
      fetchOptions(),
    );

    const resultsJson: GetResultsResponse = await resultsResponse.json();

    return {
      executionState,
      results: resultsJson.data,
    };
  } catch (error) {
    core.setFailed(error);
  }
};
