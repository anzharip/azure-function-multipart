import Busboy from "busboy";
import { HttpRequest } from "@azure/functions";
import { ParsedField } from "./types/parsed-field.type";
import { ParsedFile } from "./types/parsed-file.type";
import { ParsedMultipartFormData } from "./types/parsed-multipart-form-data.type";

export default async function parseMultipartFormData(
  request: HttpRequest
): Promise<ParsedMultipartFormData> {
  return new Promise((resolve, reject) => {
    try {
      const fields: Promise<ParsedField>[] = [];
      const files: Promise<ParsedFile>[] = [];
      const busboy = new Busboy({ headers: request.headers });

      busboy.on(
        "file",
        function (fieldname, file, filename, encoding, mimetype) {
          const arrayBuffer: Buffer[] = [];
          file.on("data", function (data) {
            arrayBuffer.push(data);
          });

          file.on("end", function () {
            const bufferFile = Buffer.concat(arrayBuffer);
            files.push(
              new Promise((resolve) => {
                resolve({
                  fieldname,
                  bufferFile,
                  filename,
                  encoding,
                  mimetype,
                });
              })
            );
          });
        }
      );

      busboy.on(
        "field",
        function (
          fieldname,
          value,
          fieldnameTruncated,
          valueTruncated,
          encoding,
          mimetype
        ) {
          fields.push(
            new Promise((resolve) => {
              resolve({
                fieldname,
                value,
                fieldnameTruncated,
                valueTruncated,
                encoding,
                mimetype,
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

      busboy.write(request.body);
    } catch (error) {
      reject(error);
    }
  });
}
