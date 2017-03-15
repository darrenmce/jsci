### JSCI - Simple ~100 line CI process written in node

#### Caveats
- only works with public git repositories (or with auth in the url.. )
- requires a docker image for build steps to be run within
- requires a Dockerfile in the repository for publishing

This is a purely educational implementation.

Usage:

create a **json config file** (myconfig.json in example) to provide your registry authentication ([docker hub](hub.docker.com) or any registry) and your workspace (where the builds get cloned to and run out of)

```json
{
  "workspace": "/path/to/workspace/root",
  "auth": {
    "hub": {
      "username": "homersimpson",
      "password": "d0hnuts"
    }
  }
}
```

based on the [example.json](https://github.com/darrenmce/jsci/blob/master/example.json) in the repository, create a build json (mybuild.json in example).

install jsci and run your Job!

```sh
npm install -g jsci
jsci --config myconfig.json -f mybuild.json
```
