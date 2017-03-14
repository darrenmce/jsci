### JSCI - Simple ~100 line CI process written in node

This is a purely educational implementation.

Usage: (after cloning this repo and being in the root)

create a local .jscirc file to provide your [docker hub](hub.docker.com) authentication and your workspace (where the builds get cloned to and run out of)

```json
{
  "workspace": "/path/to/workspace/root",
  "auth": {
    "registry": {
      "hub": {
        "username": "homersimpson",
        "password": "d0hnuts"
      }
    }
  }
}
```

based on the `example.json` in the repository, create a build json.

Run your Job!

```sh
node index.js -f mybuild.json
```
