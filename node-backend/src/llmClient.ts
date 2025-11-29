import axios from "axios";
import { LlmDraft } from "./types";

const PYTHON_LLM_URL = process.env.PYTHON_LLM_URL || "http://localhost:8000";

export async function callLlmParseInvoice(params: {
  texto: string;
  config?: { tasa_igv?: number; moneda_default?: string };
}): Promise<LlmDraft> {
  const url = `${PYTHON_LLM_URL}/parse-invoice`;
  const response = await axios.post(url, params, {
    timeout: 20000,
  });
  return response.data as LlmDraft;
}
