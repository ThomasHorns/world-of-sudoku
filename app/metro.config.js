// Metro-oppsett for World of Sudoku.
//
// Motoren og brettbanken ligger i ../packages, utenfor app-mappen. Prosjektet
// bruker ikke npm workspaces (D:-disken er exFAT og støtter ikke symlenker),
// så Expo finner ikke mappen automatisk. Derfor legges den til i watchFolders.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [path.resolve(__dirname, '..', 'packages')];

module.exports = config;
