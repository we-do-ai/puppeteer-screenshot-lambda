module.exports = {
  puppeteer: {
    connectOptions: {
      // ignoreHTTPSErrors: true
    },
    navigationOptions: {
      timeout: 5000, //5 sec
      waitUntil: ["load"],
    },
  },
};
