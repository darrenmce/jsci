const path = require('path');
const mkdirp = require('mkdirp');
const tar = require('tar-fs');
const async = require('async');
const program = require('commander');
const git = require('simple-git');
const Docker = require('dockerode');

const ciOptions = require('rc')('jsci', {
  workspace: __dirname,
  "docker": {
    "socketPath": "/var/run/docker.sock"
  },
  auth: {
    registry: {
      hub: {
        username: 'hubuser',
        password: 'changeme'
      }
    }
  }
});

program.option('-f, --file [file]', 'Path to the json build file', './example.json').parse(process.argv);
const instructions = require(path.resolve(program.file));
const buildNumber = Date.now().toString();
const workdir = path.join(ciOptions.workspace, instructions.name, buildNumber);
const docker = new Docker(ciOptions.docker);

function start() {
  mkdirp.sync(workdir);
  async.series([
    checkout.bind(null, instructions.git.repo),
    build.bind(null, instructions.build.image, instructions.build.steps),
    publish.bind(null, instructions.publish)
  ], (err) => {
    if (err) throw err;
    console.log(`Job Complete. (${instructions.name} #${buildNumber})`);
  })
}

function checkout(repo, cb) {
  return git().outputHandler((_, stdout, stderr) => {
    stdout.pipe(process.stdout);
    stderr.pipe(process.stdout);
  }).clone(repo, workdir, null, cb);
}

function build(image, steps, cb) {
  async.eachSeries(steps, runStep.bind(null, image), cb);
}

function runStep(image, step, cb) {
  console.log('RUNNING BUILD STEP:', 'Image:', image, 'Step:', step);
  docker.run(image, ['sh', '-c', step], process.stdout, { HostConfig: {Binds: [`${workdir}:/build`]}, WorkingDir: '/build' },
    (err, data, container) => {
      if (err) return cb(err);
      container.remove(cb);
    });
}

function buildImage(tag, cb) {
  console.log(`Building Image: ${tag}`);
  docker.buildImage(tar.pack(workdir), { t: tag }, cb);
}

function pushImage (tag, auth, cb) {
  console.log(`Pushing Image: ${tag}`);
  docker.getImage(tag).push({ authconfig: ciOptions.auth.registry[auth], stream: true }, cb);
}

function handleStream(stream, cb) {
  stream.on('error', cb).on('end', cb).pipe(process.stdout);
}

function publish(dockerOptions, cb) {
  const tag = `${dockerOptions.registry}/${dockerOptions.repo}:${buildNumber}`;
  async.waterfall([
    buildImage.bind(null, tag),
    handleStream,
    pushImage.bind(null, tag, dockerOptions.auth),
    handleStream
  ], cb);
}
start();
