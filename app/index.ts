import { registerRootComponent } from 'expo';

import App from './App';
import { initCrashReporting, wrapRoot } from './src/crashReporting';

// Krasjrapporter startes før appen, så feil under oppstart også fanges.
initCrashReporting();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(wrapRoot(App));
