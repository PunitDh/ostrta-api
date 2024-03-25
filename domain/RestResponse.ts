const isObject = (value: any) => value && typeof value === "object";

const getDataLength = (data: any, headers: any) => {
  const dataLength = isObject(data)
    ? JSON.stringify(data)?.length
    : String(data).length;

  const headersLength = JSON.stringify(headers)?.length;

  return dataLength + headersLength;
};

export default class RestResponse {
  output: any;
  json: any;
  status: any;
  statusText: any;
  headers: any;
  size: number;
  error: boolean;
  time: any;

  constructor(obj = {}) {
    const { data, status, statusText, headers } = this.extractValues(obj as any);

    this.output = data;
    this.json = isObject(data);
    this.status = status;
    this.statusText = statusText;
    this.headers = headers;
    this.size = getDataLength(data, headers);
    this.error = this.status >= 400;
    this.time = (obj as any).time;
  }

  extractValues(source: {
    data: any;
    status: any;
    statusText: any;
    headers: any;
    response?: any;
  }) {
    const primary = source ?? {};
    const secondary = source?.response ?? {};

    return {
      data: primary.data ?? secondary.data,
      status: primary.status ?? secondary.status,
      statusText: primary.statusText ?? secondary.statusText,
      headers: primary.headers ?? secondary.headers,
    };
  }

  setTime(time: any) {
    this.time = time;
    return this;
  }

  setOutput(obj: any) {
    const { data, headers } = this.extractValues(obj);

    this.output = data;
    this.json = isObject(data);
    this.size = getDataLength(data, headers);

    return this;
  }
}
