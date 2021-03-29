import { HttpRequest } from "@azure/functions";
import FormData from "form-data";
import fs from "fs";
import parseMultipartFormData from "../src/index";

describe("index.js", () => {
  let request: HttpRequest;

  beforeAll(async () => {
    const file1 = fs.readFileSync("test/fixture/dummy-data.json");
    const body = new FormData();
    body.append("field1", "value1");
    body.append("file1", file1);

    request = {
      method: "POST",
      url: "http://localhost:7071/api/script/mongo-replace-collection",
      headers: {
        ...body.getHeaders(),
      },
      body: body.getBuffer(),
      query: {},
      params: {},
    };
  });

  it("should populate fields property", async () => {
    const { fields, files } = await parseMultipartFormData(request);
    expect(fields.length).toBe(1);
  });

  it("should populate files property", async () => {
    const { fields, files } = await parseMultipartFormData(request);
    expect(files.length).toBe(1);
  });

  it("should parse the buffer file correctly", async () => {
    const { fields, files } = await parseMultipartFormData(request);
    const json = JSON.parse(files[0].bufferFile.toString());
    expect(json["you"]).toBe("know the rules");
    expect(json["and"]).toBe("so do I");
  });
});
