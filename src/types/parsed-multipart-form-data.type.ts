import { ParsedField } from "./parsed-field.type";
import { ParsedFile } from "./parsed-file.type";

export type ParsedMultipartFormData = {
  files: ParsedFile[];
  fields: ParsedField[];
};
