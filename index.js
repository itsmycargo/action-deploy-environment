const core = require('@actions/core');
const github = require('@actions/github');

function branchName(context) {
  if (context.payload && context.payload.pull_request) {
    return context.payload.pull_request.head.ref
  }

  return github.context.ref.replace(/refs\/heads\/(.*)/, '$1');
}

function deployName(name, environment, context) {
  if (environment == "production" || environment == "staging") {
    return `${name}-${environment}`.substr(0, 63)
  }

  const ref = branchName(context);

  return `${name}-${ref}`.toLowerCase().replace(/[^a-z0-9-]/g, "").substr(0, 63)
}

try {
  // Fetch inputs
  const name = core.getInput('name');
  const environment = core.getInput('environment');
  const domain = core.getInput('domain');

  const deploy = deployName(name, environment, github.context)
  console.log(`name: ${deploy}`);
  core.setOutput('name', deploy);

  const url = `${deploy}.${domain}`
  console.log(`url: ${url}`);
  core.setOutput('url', url);

  const output = branchName(github.context).toLowerCase().replace(/[^a-z0-9-]/g, "").substr(0, 63)
  console.log(`output: ${output}`);
  core.setOutput('branch', output);

} catch (error) {
  core.setFailed(error.message);
}
