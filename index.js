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

    
    fs.writeFileSync(filepath, data);
    if (type === 'dotenv') {
      for (const line of (data || '').split('\n')) {
        const key = line.split('=')[0];
        const value = line.replace(`${key}=`, '');
        const cmd = `KEY=${key}; VALUE=${value}; echo "$KEY=$VALUE" >> $GITHUB_ENV; echo "::add-mask::$VALUE"`
        execSync(cmd);
      }
      // execSync(`
      //   while IFS= read -r line || [[ -n "$line" ]]; do
      //     # Extract variable name and value
      //     var_name=$(echo "$line" | cut -d '=' -f 1)
      //     var_value=$(echo "$line" | cut -d '=' -f 2-)
          
      //     # Set the variable in $GITHUB_ENV
      //     echo "$var_name=$var_value" >> $GITHUB_ENV
          
      //     # Add mask for sensitive variables
      //     echo "::add-mask::$var_value"
      //   done < ${filepath}
      // `)
    }
  } catch (error) {
    core.setFailed(error.message);
  }
};

main();
