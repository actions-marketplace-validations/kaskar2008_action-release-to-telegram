# Prepare changelog for the TG message

This github action formats changelog for a better syntax, suitable for Telegram.

# Usage

Action is served to be right in the middle of two steps: `Build changelog` and `Send message to Telegram`

```yml
on:
  pull_request:
    types: [ closed ]
    branches: [ master ]

jobs:
  draft-release-notify:
    if: github.event.pull_request.merged == true

    runs-on: ubuntu-latest

    steps:
      - name: Build Changelog
        id: github_release
        uses: mikepenz/release-changelog-builder-action@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Format changelog for the message
        id: format_changelog
        uses: kaskar2008/action-release-to-telegram@v0.0.6
        with:
          template: .github/tg-message.mustache
          service-name: My first WebApp
          tag: NEW_TAG
          changelog: ${{ steps.github_release.outputs.changelog }}

      - name: Send technical release message to Telegram
        uses: appleboy/telegram-action@master
        with:
          to: ${{ secrets.TELEGRAM_TO }}
          token: ${{ secrets.TELEGRAM_TOKEN }}
          args: ${{ steps.format_changelog.outputs.message }}
          format: 'markdown'
```

# Parameters

## Inputs

### `template`

Path to the mustache template file.

Available variables:

- `serviceName` - Either provided service name or a repository name
- `repo` - Repository name
- `owner` - Repository owner
- `date` - Current date (YYYY.mm.dd)
- `tag` - Current tag for this release
- `changelog` - Release changelog

### `serviceName`

Application / Service name.

### `tag`

Current release tag.

### `changelog`

Current release changelog.

## Outputs

### `message`

Formatted message.