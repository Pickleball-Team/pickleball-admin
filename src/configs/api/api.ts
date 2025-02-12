import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CreateAxiosDefaults,
} from 'axios';
import {
  apiFailureRequestInterceptor,
  apiFailureResponseInterceptor,
  apiRequestInterceptor,
  apiSuccessResponseInterceptor,
} from './apiInterceptor';
import type { ApiResponse } from './apiResponses';
import { convertObjectToQueryParams } from '../../utils/urlUtils';

const apiRequestConfig: CreateAxiosDefaults<unknown> = {
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 0
};

export const axiosInstance: AxiosInstance = axios.create(apiRequestConfig);

// -- Request --
axiosInstance.interceptors.request.use(
  (cf) => apiRequestInterceptor(cf),
  (err) => apiFailureRequestInterceptor(err)
);

// -- Response --
axiosInstance.interceptors.response.use(
  (res) => apiSuccessResponseInterceptor(res),
  (err) => apiFailureResponseInterceptor(err)
);

class Api {
  private static buildUrl(url: string, queryParams?: unknown): string {
    return url + convertObjectToQueryParams(queryParams);
  }

  static get<T>(
    url: string,
    queryParams?: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const _url = this.buildUrl(url, queryParams);
    return axiosInstance
      .get<ApiResponse<T>>(_url, { ...config })
      .then((response) => response.data);
  }

  static post<T>(
    url: string,
    body?: unknown,
    queryParams?: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const _url = this.buildUrl(url, queryParams);
    return axiosInstance
      .post<ApiResponse<T>>(_url, body, {
        ...config,
      })
      .then((response) => response.data);
  }

  static put<T>(
    url: string,
    body?: unknown,
    queryParams?: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const _url = this.buildUrl(url, queryParams);
    return axiosInstance
      .put<ApiResponse<T>>(_url, body, {
        ...config,
      })
      .then((response) => response.data);
  }

  static patch<T>(
    url: string,
    body?: unknown,
    queryParams?: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const _url = this.buildUrl(url, queryParams);
    return axiosInstance
      .patch<ApiResponse<T>>(_url, body, {
        ...config,
      })
      .then((response) => response.data);
  }

  static delete<T>(
    url: string,
    queryParams?: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const _url = this.buildUrl(url, queryParams);
    return axiosInstance
      .delete<ApiResponse<T>>(_url, { ...config })
      .then((response) => response.data);
  }
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export default Api;