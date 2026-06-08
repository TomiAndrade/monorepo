const { spawnSync } = require('child_process');

const VIDEO_EXTENSIONS = new Set(['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv']);

let _ffprobeAvailable = null;
function isFFprobeAvailable() {
  if (_ffprobeAvailable !== null) return _ffprobeAvailable;
  const result = spawnSync('ffprobe', ['-version'], { encoding: 'utf8', stdio: 'pipe' });
  _ffprobeAvailable = result.status === 0;
  return _ffprobeAvailable;
}

async function extract(filePath) {
  const warnings = [];
  const data = {};

  try {
    if (!isFFprobeAvailable()) {
      warnings.push('FFmpeg/ffprobe not available — video metadata skipped');
      return { data, warnings };
    }

    const result = spawnSync(
      'ffprobe',
      ['-v', 'quiet', '-print_format', 'json', '-show_streams', '-show_format', filePath],
      { encoding: 'utf8', stdio: 'pipe' }
    );

    if (result.status !== 0) {
      throw new Error(result.stderr || 'ffprobe exited with non-zero status');
    }

    const probeData = JSON.parse(result.stdout);
    const videoStream = probeData.streams?.find(s => s.codec_type === 'video');

    if (videoStream) {
      data.width = videoStream.width;
      data.height = videoStream.height;
    }

    const duration = parseFloat(probeData.format?.duration);
    if (!isNaN(duration)) {
      data.durationSeconds = parseFloat(duration.toFixed(2));
    }
  } catch (err) {
    warnings.push(`Video metadata extraction failed: ${err.message}`);
  }

  return { data, warnings };
}

module.exports = { extract, VIDEO_EXTENSIONS };
