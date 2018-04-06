const _cliProgress = require('cli-progress');

const bar1 = new _cliProgress.Bar({
  stopOnComplete: true,
}, _cliProgress.Presets.shades_classic);

bar1.start(200, 0);
let progress = 0;

let interval = setInterval(() => {
  progress += 10;
  bar1.update(progress);

  if (progress === 200) {
    clearInterval(interval);
    bar1.stop();
    console.log('finished');
  }
}, 500);
