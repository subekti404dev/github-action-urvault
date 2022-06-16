const axios = require("axios").default;
const core = require("@actions/core");
const fs = require('fs');

const main = async () => {
  try {
    const baseURL = core.getInput("base-url");
    const path = core.getInput("path");
    const token = core.getInput("token");
    const key = core.getInput("key");
    const filename = core.getInput("to-file");

    let version;

    const opts = {
      headers: {
        "X-Vault-Token": token,
      },
    };
    if (!version) {
      const urlVersion = `${baseURL}/v1/secret/metadata/${path}`;
      const respVersion = await axios.get(urlVersion, opts);
      version = respVersion?.data?.data?.current_version || 1;
    }

    const url = `${baseURL}/v1/secret/data/${path}?version=${version}`;

    const response = await axios.get(url, opts);
    const data = response?.data?.data?.data;
    let output = data;
    if (key) output = data[key];
    
    if (filename) {
      fs.writeFileSync(filename, output);
    }
    
    core.setOutput("data", output);
  } catch (error) {
    core.setFailed(error.message);
  }
};

main();
