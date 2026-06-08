jest.mock('child_process', () => ({ spawnSync: jest.fn() }));

describe('videoExtractor', () => {
  let extract;
  let mockSpawnSync;

  // Reset module registry before each test to clear the cached _ffprobeAvailable flag
  beforeEach(() => {
    jest.resetModules();
    jest.doMock('child_process', () => ({ spawnSync: jest.fn() }));
    mockSpawnSync = require('child_process').spawnSync;
    extract = require('../../src/metadata/extractors/videoExtractor').extract;
  });

  test('adds warning when ffprobe is not available', async () => {
    mockSpawnSync.mockReturnValue({ status: 1, stderr: 'ffprobe not found', stdout: '' });

    const result = await extract('/path/to/video.mp4');

    expect(result.warnings).toContain('FFmpeg/ffprobe not available — video metadata skipped');
    expect(result.data).toEqual({});
  });

  test('extracts durationSeconds, width and height when ffprobe succeeds', async () => {
    const ffprobeJson = JSON.stringify({
      streams: [{ codec_type: 'video', width: 1920, height: 1080 }],
      format: { duration: '120.5' },
    });

    mockSpawnSync
      .mockReturnValueOnce({ status: 0, stdout: 'ffprobe version 4.x', stderr: '' }) // -version
      .mockReturnValueOnce({ status: 0, stdout: ffprobeJson, stderr: '' });           // probe

    const result = await extract('/path/to/video.mp4');

    expect(result.warnings).toHaveLength(0);
    expect(result.data.width).toBe(1920);
    expect(result.data.height).toBe(1080);
    expect(result.data.durationSeconds).toBe(120.5);
  });

  test('adds warning when ffprobe exits with non-zero status on the probe', async () => {
    mockSpawnSync
      .mockReturnValueOnce({ status: 0, stdout: 'ffprobe version 4.x', stderr: '' })
      .mockReturnValueOnce({ status: 1, stderr: 'Invalid data found', stdout: '' });

    const result = await extract('/path/to/video.mp4');

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('Video metadata extraction failed');
  });

  test('adds warning when ffprobe output is not valid JSON', async () => {
    mockSpawnSync
      .mockReturnValueOnce({ status: 0, stdout: 'ffprobe version 4.x', stderr: '' })
      .mockReturnValueOnce({ status: 0, stdout: 'not valid json', stderr: '' });

    const result = await extract('/path/to/video.mp4');

    expect(result.warnings.length).toBeGreaterThan(0);
  });

  test('handles missing video stream gracefully', async () => {
    const ffprobeJson = JSON.stringify({
      streams: [{ codec_type: 'audio' }],
      format: { duration: '60.0' },
    });

    mockSpawnSync
      .mockReturnValueOnce({ status: 0, stdout: 'ffprobe version 4.x', stderr: '' })
      .mockReturnValueOnce({ status: 0, stdout: ffprobeJson, stderr: '' });

    const result = await extract('/path/to/audio.mp4');

    expect(result.warnings).toHaveLength(0);
    expect(result.data.width).toBeUndefined();
    expect(result.data.durationSeconds).toBe(60.0);
  });
});
