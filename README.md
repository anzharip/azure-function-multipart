azure-function-multipart
===========

Module to parse multipart/form-data on Azure Functions. 

Note: 
Will also works on any Node's HTTP request object, asides of Azure Functions' HttpRequest object, as this package is based on busboy. 

Install
=======

```
npm i @anzp/azure-function-multipart
```


Examples
========

Parsing multipart/form-data on Azure Function. This will return the parsed fields and files back as the response: 

```typescript
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import parseMultipartFormData from "@anzp/azure-function-multipart";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { fields, files } = await parseMultipartFormData(req);
  context.log("HTTP trigger function processed a request.");
  const name = req.query.name || (req.body && req.body.name);
  const responseMessage = {
    fields,
    files,
  };

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: responseMessage,
  };
};

export default httpTrigger;

```

Example client request using CURL: 
```
curl --request POST \
  --url http://localhost:7071/api/HttpTrigger1 \
  --header 'Content-Type: multipart/form-data; boundary=---011000010111000001101001' \
  --form update=false \
  --form collection=@/Users/anzhari/masterdata/managements.json
```

This is the example reponse received on the client: 
```json
{
  "fields": [
    {
      "fieldname": "update",
      "value": "false",
      "fieldnameTruncated": false,
      "valueTruncated": false,
      "encoding": "7bit",
      "mimetype": "text/plain"
    }
  ],
  "files": [
    {
      "fieldname": "file",
      "bufferFile": {
        "type": "Buffer",
        "data": [
          91,
          10,
          ...
          10,
          93
        ]
      },
      "filename": "managements.json",
      "encoding": "7bit",
      "mimetype": "application/json"
    }
  ]
}

```