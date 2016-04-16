# gh-pages-generator
Multi-page site generator converting markdown files to github pages

## Istall

```
npm install -g gh-pages-generator
```


## Usage

```
gh-pages-generator site_config.json
```

This utility generates site for gh-pages using multiple markdown files.

It replaces the links between the files and generates site navigation.

Site configuration file is defined by [the JSON-schema](https://github.com/epoberezkin/gh-pages-generator/blob/master/site_config_schema.json).

See [example site configuration in Ajv repository](https://github.com/epoberezkin/ajv/blob/gh-pages/site.json).

If config file is not specified, `site.json` is used.

You can automate site generation with Travis. See [example script](https://github.com/epoberezkin/ajv/blob/master/scripts/travis-gh-pages).
