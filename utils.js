const chromium = require("chrome-aws-lambda");
const { readdir, exists } = require("fs");
const { join } = require("path");

const getQueryAndBodyParametersMap = (event) => {
  const map = new Map();

  const queryParams = event.queryStringParameters || {};
  for (let [key, value] of Object.entries(queryParams)) {
    map.set(key, value);
  }

  if (event.body) {
    try {
      const decodedBody = event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf8")
        : event.body;

      const body =
        typeof decodedBody === "string" ? JSON.parse(decodedBody) : decodedBody;
      for (let [key, value] of Object.entries(body)) {
        map.set(key, value);
      }
    } catch (e) {
      console.error("Failed to parse body", e);
    }
  }

  return map;
};

const getHeaderValues = (event, headerName) => {
  const entries = Object.entries(event.multiValueHeaders || {});
  for (let [name, values] of entries) {
    if (name.toLowerCase() === headerName.toLowerCase()) {
      return values;
    }
  }
  return [];
};

const isHeaderValuePresent = (event, headerName, expectedValue) => {
  const expectedValueArray = Array.isArray(expectedValue)
    ? expectedValue
    : [expectedValue];

  const headerValues = getHeaderValues(event, headerName);

  return headerValues.some(
    (x) => expectedValueArray.indexOf(x.toLowerCase()) >= 0
  );
};

const registerDefaultFontsAsync = (dir = "fonts") => {
  return new Promise((resolve, reject) => {
    const fontDir = join(process.cwd(), dir);
    exists(fontDir, (exists) => {
      if (!exists) {
        console.log(
          "Fonts directory does not exist. Skipping registration of default fonts."
        );
        return resolve();
      }
      readdir(fontDir, async (err, files) => {
        if (err) {
          return reject(err);
        }
        try {
          await Promise.all(
            files
              .filter((f) => f !== ".keep")
              .map((file) => {
                const fontPath = join(fontDir, file);
                return chromium.font(fontPath);
              })
          );
        } catch (e) {
          return reject(e);
        }
        resolve();
      });
    });
  });
};

module.exports = {
  getQueryAndBodyParametersMap,
  isHeaderValuePresent,
  registerDefaultFontsAsync,
};
