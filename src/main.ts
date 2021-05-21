import * as core from "@actions/core";

import { createExecution, getResults } from "./api";

async function run(): Promise<void> {
  try {
    const executionId = await createExecution();

    if (!executionId) {
      throw new Error("Failed to create business rule service execution.");
    }

    const data = await getResults(executionId);

    if (!data) {
      throw new Error("Execution returned no results.");
    }

    const { executionState, results } = data;

    results.forEach((result) => {
      const { ruleSignature, message, severityLevel } = result.attributes;
      core.info(`${ruleSignature}: ${message} (${severityLevel})`);
    });

    if (executionState === "failed") {
      core.setFailed("Rule execution failed.");
    }

    core.info("Success!");
  } catch (error) {
    core.info("Action failed.");
    core.setFailed(error);
  }
}

run();
