import * as core from "@actions/core";
import fetch from "node-fetch";

import { CreateExecutionResponse } from "./responses";
import { fetchOptions } from "./utils";
import * as Routes from "./routes";

const scope = core.getInput("validation_scope");

/**
 * Initiate business rule service execution.
 * @returns Promise object that is resolved with the ID of the created execution
 * (or undefined if it failed for whatever reason).
 */
export const createExecution = async (): Promise<string | undefined> => {
  try {
    core.info(`Initiating business rule service execution ...`);

    const payload = {
      validation_scope: scope,
      severity_level_threshold_to_trigger_failure: 5,
    };

    const response = await fetch(Routes.createExecution(), {
      ...fetchOptions("POST"),
      body: JSON.stringify(payload),
    });

    const json: CreateExecutionResponse = await response.json();
    const { id } = json.data;

    core.info(`Created business rule service execution with ID ${id}.`);

    return id;
  } catch (error) {
    core.setFailed(error);
  }
};
