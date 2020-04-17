import http from "http";
import https from "https";
import { StringDecoder } from "string_decoder";

export const makeRequest = (url: string | undefined, data = "", headers: any = {}, timeout = 5000): Promise<string> => {
  if (!url) {
      throw "url must be defined!";
  }
  const contentLength = Buffer.byteLength(data, "utf-8");

  headers["Content-Length"] = contentLength;
  headers["Content-Type"] = "text/xml; charset=utf-8";
  headers["Connection"] = "keep-alive";
  const uri = new URL(url);
  
  return new Promise((resolve, reject): void => {
      const response: string[] = [];
      const decoder = new StringDecoder("utf8");

      const options: https.RequestOptions = {
        hostname: uri.hostname,
        host: uri.hostname,
        port: uri.port,
        path: uri.pathname,
        method: "POST",
        headers,
        // rejectUnauthorized: false,
        timeout
      };
      
      const executer = (options: any, cb: (response: http.IncomingMessage) => void) => {
          const req = https.request(options, (res) => {
              if (req.aborted) return reject("aborted");
              cb(res);
          });
          req.on("error", (err) => reject(err));
          req.write(Buffer.from(data));
          req.end();
      };

      const reqCallback = (res: http.IncomingMessage) => {
          res.on("data", (chunk) => {
              const str = decoder.write(chunk);
              response.push(str);
              // resolve(chunk.toString("utf8"));
          });
          res.on("end", () => {
              decoder.end();
              resolve(response.join(""));
          });
          res.on("error", (err) => reject(err));
      };
      executer(options, reqCallback);
  });
};