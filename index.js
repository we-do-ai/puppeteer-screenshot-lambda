const chromium = require("chrome-aws-lambda");
const config = require("./config");
const {
  getQueryAndBodyParametersMap,
  isHeaderValuePresent,
  registerDefaultFontsAsync,
} = require("./utils");

exports.handler = async (event) => {
  let result = null;
  let browser = null;

  const parameters = getQueryAndBodyParametersMap(event);

  const url = parameters.get("url");
  const html = parameters.get("html");

  if (url === undefined && html === undefined) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "text/plain",
      },
      body: "Please provide an url or html.",
    };
  }

  let type = "png";
  if (
    !isHeaderValuePresent(event, "Accept", "image/png") &&
    isHeaderValuePresent(event, "Accept", ["image/jpeg", "image/jpg"])
  ) {
    type = "jpeg";
  }

  await registerDefaultFontsAsync();

  const fonts = parameters.get("fonts");
  if (Array.isArray(fonts)) {
    await Promise.all(
      fonts.map(async (url) => {
        try {
          await chromium.font(url);
        } catch (e) {
          console.log("Failed to load font", url, e);
        }
      })
    );
  }

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ...config.puppeteer.connectOptions,
    });

    let page = await browser.newPage();

    if (url !== undefined) {
      await page.goto(url, config.puppeteer.navigationOptions);
    } else if (html !== undefined) {
      await page.setContent(html, config.puppeteer.navigationOptions);
    }

    const bodyEl = await page.$("body");
    let rect = {};
    if (bodyEl) {
      rect = await bodyEl.boxModel();
    }

    const width = parseInt("" + (parameters.get("width") || rect.width || 800));
    const height = parseInt(
      "" + (parameters.get("height") || rect.height || 600)
    );

    await page.setViewport({
      width,
      height,
    });

    const screenshotOptions = {
      type,
      clip: {
        x: 0,
        y: 0,
        width,
        height,
      },
    };

    if (type === "jpeg") {
      const quality = parameters.get("quality");
      if (quality !== undefined) {
        const qualityNumber = parseInt(quality);
        if (Number.isInteger(qualityNumber)) {
          screenshotOptions.quality = qualityNumber;
        }
      }
    }

    const omitBackground = parameters.get("omitBackground");
    if (omitBackground == true || omitBackground === "true") {
      screenshotOptions.omitBackground = true;
    }

    const fullPage = parameters.get("fullPage");
    if (fullPage == true || fullPage === "true") {
      screenshotOptions.fullPage = true;
    }

    result = await page.screenshot(screenshotOptions);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "image/" + type,
    },
    body: result.toString("base64"),
    isBase64Encoded: true,
  };
};
