const axios = require("axios").default;
const core = require("@actions/core");
const fs = require('fs');
const { execSync } = require('child_process');

const main = async () => {
  try {
    const baseURL = core.getInput("baseurl");
    const token = core.getInput("token");
    const id = core.getInput("id");
    const filename = core.getInput("filename");
    const type = core.getInput("type") || 'dotenv';

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

    const filepath = filename || (id + ext) ;
    const url = `${baseURL}/v1/vwt/${id}?type=${type}`;
    const { data } = await axios.get(url, {
      headers: {
        "X-API-Token": token,
      }
    });

    if (type === 'dotenv') {
      for (const line of (data || '').split('\n')) {
        const key = line.split('=')[0];
        const value = line.replace(`${key}=`, '');
        execSync(`KEY=${key}`);
        execSync(`VALUE=${value}`);
        execSync(`echo "$KEY=$VALUE" >> $GITHUB_ENV`);
        execSync(`echo "::add-mask::$VALUE"`);
      }
    }

    fs.writeFileSync(filepath, data);
  } catch (error) {
    core.setFailed(error.message);
  }
};

main();
