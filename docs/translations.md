# Translations

[Translation are managed through the crowdin platform](https://crowdin.com/project/ala-i18n).  
If you would like to contribute, please visit the crowdin project page using the link above  
and request to join the translation team for your language.

## Updating translations
A [script](./scripts/update-translations.sh) is provided to download the latest translations from crowdin.
Running it requires [bash](https://www.gnu.org/software/bash/) and [docker](https://www.docker.com/) to be installed on your system.

To run the script, you need to provide a `CROWDIN_TOKEN` through an environment variable.
Additionally, you can choose which languages you want to download by providing a `LANGUAGES` environment variable.  
(It will only download Dutch by default 🦁)
```commandline
LANGUAGES="es-ES fr" CROWDIN_TOKEN=this-is-my-crowdin-token ./scripts/update-translations.sh
```

## Additional customizations

Should you want to override the translations provided by crowdin, you can do so by placing a `messages_<lang-code>.properties` file in a folder `i18n/override` in the relevant component.

For example, to override the title of the map on the collections page,  
you could do something like this:
```commandline
mkdir -p ./config/collectory/i18n/override
echo "public.map.header.title=I want a specific title for my portal" >> config/collectory/i18n/override/messages_nl.properties
```