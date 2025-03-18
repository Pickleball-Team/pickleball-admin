import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CreateAxiosDefaults,
} from 'axios';

import { REQUEST_TIMEOUT_MS } from './apiConstants';
import {
  apiRequestInterceptor,
  apiFailureRequestInterceptor,
  apiSuccessResponseInterceptor,
  apiFailureResponseInterceptor,
} from './apiInterceptor';
import { ApiResponse } from './apiResponses';
import { convertObjectToQueryParams } from '../../utils/urlUtils';

const apiRequestConfig: CreateAxiosDefaults<unknown> = {
  baseURL: `${
    import.meta.env.API_BASE_URL ||
    'https://pickbleballcapston-a4eagpasc9fbeeb8.eastasia-01.azurewebsites.net/api'
  }`,
  // baseURL: 'http://localhost:5098/api',
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
};

export const axiosInstance: AxiosInstance = axios.create(apiRequestConfig);

// todo bug is here
// -- Request --
axiosInstance.interceptors.request.use(
  (cf) => {
    return apiRequestInterceptor(cf);
  },
  (err) => {
    return apiFailureRequestInterceptor(err);
  }
);

// -- Response --
axiosInstance.interceptors.response.use(
  (res) => {
    return apiSuccessResponseInterceptor(res);
  },
  (err) => {
    return apiFailureResponseInterceptor(err);
  }
);

class Api {
  static get<T>(
    url: string,
    queryParams?: unknown,
    config: AxiosRequestConfig = {}
  ) {
    const _url = url + convertObjectToQueryParams(queryParams);
    return axiosInstance.get<T>(_url, { ...config }) as unknown as Promise<
      ApiResponse<T>
    >;
  }

  static post<T>(
    url: string,
    body?: unknown,
    queryParams?: unknown,
    config: AxiosRequestConfig = {}
  ) {
    const _url = url + convertObjectToQueryParams(queryParams);
    return axiosInstance.post<T>(_url, body, {
      ...config,
    }) as unknown as Promise<ApiResponse<T>>;
  }

  static async put<T>(
    url: string,
    body?: unknown,
    queryParams?: unknown,
    config: AxiosRequestConfig = {}
  ) {
    const _url = url + convertObjectToQueryParams(queryParams);
    return axiosInstance.put<T>(_url, body, {
      ...config,
    }) as unknown as Promise<ApiResponse<T>>;
  }

  static async patch<T>(
    url: string,
    body?: unknown,
    queryParams?: unknown,
    config: AxiosRequestConfig = {}
  ) {
    const _url = url + convertObjectToQueryParams(queryParams);
    return axiosInstance.patch<T>(_url, body, {
      ...config,
    }) as unknown as Promise<ApiResponse<T>>;
  }

  static async delete<T>(
    url: string,
    queryParams?: unknown,
    config: AxiosRequestConfig = {}
  ) {
    const _url = url + convertObjectToQueryParams(queryParams);
    return axiosInstance.delete<T>(_url, { ...config }) as unknown as Promise<
      ApiResponse<T>
    >;
  }
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export default Api;