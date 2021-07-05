const core = require('@actions/core');
const github = require('@actions/github');
const Mustache = require('mustache');
const path = require('path');
const fs = require('fs');

/**
 * Resolves the repository path, relatively to the GITHUB_WORKSPACE
 */
function retrieveRepositoryPath() {
  let githubWorkspacePath = process.env['GITHUB_WORKSPACE'];

  if (!githubWorkspacePath) {
    throw new Error('GITHUB_WORKSPACE not defined');
  }

  githubWorkspacePath = path.resolve(githubWorkspacePath);
  core.debug(`GITHUB_WORKSPACE = '${githubWorkspacePath}'`);

  return githubWorkspacePath;
}

const DefaultTemplate = `
📌 Service: *{{ serviceName }}*
🔸 Development area: *Frontend*
🗓 Date: *{{ date }}*
🏷 Version: {{ tag }}
🔗 Release: https://github.com/{{ owner }}/{{ repo }}/releases/tag/{{ tag }}

{{ changelog }}
`;

function clearChangelog(input = '') {
  return input.replace(/(\#\# )|( \(\#[0-9]{1,}\))/g, '').trim();
}

try {
  const inputs = {
    template: core.getInput("template"),
    serviceName: core.getInput("service-name"),
    tag: core.getInput("tag"),
    changelog: clearChangelog(core.getInput("changelog")),
  };

  const params = {
    serviceName: inputs.serviceName || github.context.repo.repo,
    repo: github.context.repo.repo,
    owner: github.context.repo.owner,
    date: new Date().toLocaleDateString('ru-RU', {year: 'numeric', month: '2-digit', day: '2-digit'}),
    tag: inputs.tag,
    changelog: inputs.changelog,
  };

  let templateMessage = DefaultTemplate;

  try {
    templateMessage = fs.readFileSync(path.resolve(retrieveRepositoryPath(), inputs.template)).toString();
  } catch (e) {
    core.error('Template file was provided, but can not be injected');
    core.error(e);
  }

  const rendered = Mustache.render(templateMessage, params);
  core.setOutput('message', rendered);
} catch (error) {
  core.setFailed(error.message);
}
