export enum HttpMethod {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
}

export interface AxiosRequest {
  method: HttpMethod;
  path: string;
  body?: Object;
  params?: Record<string, any>;
}