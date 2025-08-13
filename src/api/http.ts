// src/api/http.ts
import axios from "axios";

export const apiClient = axios.create({
  timeout: 2000, // 2s timeout for all requests
});

export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

/**
 * A unified response handler for API calls.
 * @param promise The promise to resolve.
 * @returns An ApiResponse object.
 */
export async function handleApiResponse<T>(
  promise: Promise<any>
): Promise<ApiResponse<T>> {
  try {
    const response = await promise;
    console.log("API Response:", response.status, response.data);
    return { ok: true, data: response.data };
  } catch (error: any) {
    if (axios.isCancel(error)) {
      return { ok: false, error: "Request canceled" };
    }
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      "An unknown error occurred";
    console.error("API Error:", errorMessage, error.response?.status);
    return { ok: false, error: errorMessage };
  }
}
