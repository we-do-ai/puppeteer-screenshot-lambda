# Puppeteer Screenshot Lambda

This lambda together with an AWS REST API Gateway offers a reusable API to screenshot websites. You either provide an URL or the HTML content.

## Install

Run `npm install` and deploy this application bundle to any `nodejs12.x` AWS Lambda. You should allocate at least 512 MB of RAM to your Lambda, however 1600 MB (or more) is recommended.
To be able to invoke the lambda using HTTP, set up a REST API Gateway using the `LAMBDA_PROXY` integration. No further configuration is required.

## Usage

By default, an HTTP request of any method will return a `png` screenshot. By setting the `Accept: image/jpeg` header, a `jpeg` screenshot can be created.
Either the `url` or the `html` parameter is required, all others are optional.

The following parameters can be set either via a URL query or in a JSON object in the request's body.

| Parameter             | Description                                                                                                                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| url : string          | URL of the website to screenshot                                                                                                                                                                    |
| html : string         | HTML content to set for the screenshot                                                                                                                                                              |
| width : number        | Pixel units to set width. Defaults to the body element's width or (if no body element is present) to 800px                                                                                          |
| height : number       | Pixel units to set height. Defaults to the body element's height or (if no body element is present) to 600px                                                                                        |
| quality : number      | JPEG quality between 0 and 100. Can only be set if a `jpeg` screenshot is created.                                                                                                                  |
| omitBackground : bool | If `true` and screenshot type is `png`, this hides the default white background and allows capturing screenshots with transparency. Defaults to false.                                              |
| fullPage : bool       | If `true`, takes a screenshot of the full scrollable page. Defaults to false                                                                                                                        |
| fonts : string[]      | Pass a URL to e.g. some `ttf` truetype font file on any CDN. This will be downloaded into the Chromium instance before it is launched. Please also see the local font hint below to save resources. |

## Configuration

### Puppeteer

In the `config.js`, you can set some options.

| Config                                | Description                                                                                                                                                                                                                                                                      |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| puppeteer.connectOptions : object     | The [puppeteer connect options](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#puppeteerconnectoptions), i.e. `ignoreHTTPSErrors` or `defaultViewport` can be set here.                                                                                          |
| puppeteer.navigationOptions : object | The options for [`page.goto`](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pagegotourl-options) and [`page.setContent`](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pagesetcontenthtml-options) can be set, i.e. `timeout` and `waitUntil`. |

## Fonts

By default, the `chrome-aws-lambda` instance comes only with the "Open Sans" font. You can download and place custom fonts (e.g. truetype ttf files) into the `fonts` directory and they will automatically be loaded.

This is the recommended way over the `fonts` parameter as it saves resources of your Lambda.
