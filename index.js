const core = require('@actions/core');
const github = require('@actions/github');
const Mustache = require('mustache');

const DefaultTemplate = `
📌 Service: *{{ serviceName }}*
🔸 Development area: *Frontend*
🗓 Date: *{{ date }}*
🎯 Target: *Prod*
🏷 Version: {{ tag }}
🔗 Release: https://github.com/{{ owner }}/{{ repo }}/releases/tag/{{ tag }}

{{ changelog }}
`;

function clearChangelog(input = '') {
  return input.replace(/\#\# /g, '').trim();
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
    templateMessage = require(inputs.template);
  } catch (e) {
    core.error('Template file was provided, but can not be injected');
    core.error(e);
  }

  const rendered = Mustache.render(templateMessage, params);
  core.setOutput('message', rendered);
} catch (error) {
  core.setFailed(error.message);
}
