import Busboy from "busboy";
import { HttpRequest } from "@azure/functions";
import { ParsedField } from "./types/parsed-field.type";
import { ParsedFile } from "./types/parsed-file.type";
import { ParsedMultipartFormData } from "./types/parsed-multipart-form-data.type";
import { Config } from "./types/config.type";
import { IncomingHttpHeaders } from "http";

export default async function parseMultipartFormData(
  request: HttpRequest,
  options?: Config
): Promise<ParsedMultipartFormData> {
  return new Promise((resolve, reject) => {
    try {
      const fields: Promise<ParsedField>[] = [];
      const files: Promise<ParsedFile>[] = [];

      let busboy;
      if (options) {
        busboy = Busboy({
          headers: (request.headers as unknown) as IncomingHttpHeaders,
          ...options,
        });
      } else {
        busboy = Busboy({
          headers: (request.headers as unknown) as IncomingHttpHeaders,
        });
      }

      busboy.on(
        "file",
        function (name, stream, { filename, encoding, mimeType }) {
          const arrayBuffer: Buffer[] = [];
          stream.on("data", function (data) {
            arrayBuffer.push(data);
          });

          stream.on("end", function () {
            const bufferFile = Buffer.concat(arrayBuffer);
            files.push(
              new Promise((resolve) => {
                resolve({
                  name,
                  bufferFile,
                  filename,
                  encoding,
                  mimeType,
                });
              })
            );
          });
        }
      );

      busboy.on(
        "field",
        function (
          name,
          value,
          { nameTruncated, valueTruncated, encoding, mimeType }
        ) {
          fields.push(
            new Promise((resolve) => {
              resolve({
                name,
                value,
                nameTruncated,
                valueTruncated,
                encoding,
                mimeType,
              });
            })
          );
        }
      );

      busboy.on("finish", async function () {
        resolve({
          fields: await Promise.all(fields),
          files: await Promise.all(files),
        });
      });

      busboy.end(request.body);
    } catch (error) {
      reject(error);
    }
  });
}
