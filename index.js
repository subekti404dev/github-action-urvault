const axios = require("axios").default;
const core = require("@actions/core");
const fs = require('fs');

const main = async () => {
  try {
    const baseURL = core.getInput("baseurl");
    const token = core.getInput("token");
    const id = core.getInput("id");
    const filename = core.getInput("filename");
    const type = core.getInput("type");

    let ext = '.env';
    if (type === 'json') {
      ext = '.json'
    }
    if (type === 'toml') {
      ext = '.toml'
    }
    if (type === 'yaml') {
      ext = '.yaml'
    }

    const filepath = filename || id + ext ;
    const url = `${baseURL}/v1/vwt/${id}?type=${type}`;
    const { data } = await axios.get(url, {
      headers: {
        "X-API-Token": token,
      }
    });

    fs.writeFileSync(filepath, data);
  } catch (error) {
    core.setFailed(error.message);
  }
};

main();
