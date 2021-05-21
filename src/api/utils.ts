import * as core from "@actions/core";
import { Headers, RequestInit } from "node-fetch";

const token = core.getInput("auth_token");

export const fetchOptions = (method = "GET"): RequestInit => {
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);

  if (method === "POST") {
    headers.set("Content-Type", "application/json");
  }

  return {
    method,
    headers,
  };
};
