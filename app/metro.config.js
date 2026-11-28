// Metro-oppsett for World of Sudoku.
//
// Motoren og brettbanken ligger i ../packages, utenfor app-mappen. Prosjektet
// bruker ikke npm workspaces (D:-disken er exFAT og støtter ikke symlenker),
// så Expo finner ikke mappen automatisk. Derfor legges den til i watchFolders.
//
// getSentryExpoConfig er Expos standardoppsett pluss Debug ID-er, slik at
// krasjrapporter i Sentry kan kobles til riktig kildekart.
const path = require('path');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);

config.watchFolders = [path.resolve(__dirname, '..', 'packages')];

module.exports = config;
