#! /usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var ajv = require('ajv')({ "useDefaults": true, "allErrors": true });
var doT = require('dot');

var config = JSON.parse(fs.readFileSync(process.argv[2] || 'site.json'));
var schema = require('./site_config_schema.json');
var valid = ajv.validate(schema, config);
config.repository = escapePath(config.repository);

if (!valid) {
  console.log('site configuration file is invalid')
  console.log(ajv.errorsText(ajv.errors, { separator: '\n' }));
  process.exit(1);
}

var frontMatter, navTemplate, repoPattern;

prepareTemplates();
config.pages.forEach(createPage);
if (config.navigation) generateNavigation();


function prepareTemplates() {
  doT.templateSettings.strip = false;
  frontMatter = fs.readFileSync(path.join(__dirname, 'front_matter.dot'));
  frontMatter = doT.compile(frontMatter);

  navTemplate = fs.readFileSync(path.join(__dirname, 'navigation.dot'));
  navTemplate = doT.compile(navTemplate);
}


function createPage(page) {
  readFile(page);
  replaceLinks(page);
  addFrontMatter(page);
  writePage(page);
}


function generateNavigation() {
  try { fs.mkdirSync(config.folders.includes); } catch (e) {}
  var navHtml = navTemplate({ navigation: config.navigation, site: config.folders.site });
  var navPath = path.join(config.folders.includes, 'nav.html');
  fs.writeFileSync(navPath, navHtml);
}


function readFile(page) {
  var sourcePath = path.join(config.folders.source, page.file);
  page.content = fs.readFileSync(sourcePath, 'utf8');
}


var rootRegex;
function replaceLinks(page) {
  config.pages.forEach(replaceLinksToPage);
  if (config.folders.site) replaceLinksToRoot();

  function replaceLinksToPage(toPage) {
    if (!toPage.linkRegex) {
      var pagePathPattern = config.repository + escapePath('/blob/master/' + toPage.file);
      toPage.linkRegex = new RegExp(pagePathPattern, 'g');
    }
    page.content = page.content.replace(toPage.linkRegex, toPage.page + '.html');
  }

  function replaceLinksToRoot() {
    rootRegex = rootRegex || new RegExp(config.repository + '(?:\\/)?#', 'g');
    page.content = page.content.replace(rootRegex, '/' + config.folders.site + '#');
  }
}


function addFrontMatter(page) {
  page.content = frontMatter({ config: config, page: page }) + page.content;
}


function writePage(page) {
  var targetPath = path.join(config.folders.target, page.page + '.md');
  fs.writeFileSync(targetPath, page.content);
}


function escapePath(str) {
  return str.replace(/(\/|\.)/g, '\\$1');
}
