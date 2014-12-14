food-app
========

> The one and only food app

#### Install
```
npm install
grunt build
```

Building the application will deploy the app in a /dist folder.

You'll also need to modify the:
	1) .htaccess / web.config file so that the rewrite rule matches the path of the index.html
	2) base href in src/index.html (same value as 1))
	3) api url (in src/app.js), assuming the node server resides somewhere else.
