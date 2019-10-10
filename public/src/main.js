import localstore from 'store';
import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;

if (window.state.is_electron) {
  document.body.addEventListener('click', electronSpecificOpenLink);

  // If click on a link with a specific class, open in the browser and not in electron.
  function electronSpecificOpenLink(event) {
    event.path.every(item => {
      if (item.classList !== undefined && item.classList.length > 0) {
        if (item.classList.contains('js--openInBrowser')) {
          const shell = window.require('electron').shell;
          event.preventDefault();
          shell.openExternal(item.href);
          return false;
        } else if (item.classList.contains('js--openInNativeApp')) {
          const shell = window.require('electron').shell;
          event.preventDefault();
          shell.openItem(item.getAttribute('href'));
          return false;
        }
      }
      return true;
    });
  }
}

document.addEventListener(
  'dragover',
  function(event) {
    event.preventDefault();
    return false;
  },
  false
);

document.addEventListener(
  'drop',
  function(event) {
    event.preventDefault();
    return false;
  },
  false
);

import app from './vue/app.js';
