export type Config = {
  highWaterMark?: number;
  fileHwm?: number;
  defCharset?: string;
  preservePath?: boolean;
  limits?: {
    fieldNameSize?: number;
    fieldSize?: number;
    fields?: number;
    fileSize?: number;
    files?: number;
    parts?: number;
    headerPairs?: number;
  };
};
