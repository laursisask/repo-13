import { Howl } from 'howler';

export class AudioProxy {
  private assetPath: string;
  private audio: Howl | undefined;

  constructor(assetPath: string) {
    // console.log('Audio::constructor()', assetPath);
    this.assetPath = assetPath;

    this.audio = new Howl({
      src: [this.assetPath],
      preload: true,
      // onload: (res) => console.log('Audio::Preloaded', res, this.assetPath),
      // onplay: (res) => console.log('Audio::Preplay', res, this.assetPath),
      // onplayerror: (res) => console.log('Audio::Preplay error', res, this.assetPath),
      // onpause: (res) => console.log('Audio::Prepause', res, this.assetPath),
      // onmute: (res) => console.log('Audio::Premute', res, this.assetPath),
    });
  }

  public get isPlaying(): boolean {
    return (this.audio) ? this.audio.playing() : false;
  }

  public play(spriteOrId?: string | number | undefined): number {
    // console.log('Audio::play()', this.assetPath);
    if (!this.audio) {
      this.audio = new Howl({
        src: [this.assetPath],
        autoplay: true
      });
      // console.log('Audio::autoplay', this.assetPath, spriteOrId);
      return 0;
    } else {
      // console.log('Audio::play old file', this.assetPath, spriteOrId);
      return this.audio.play(spriteOrId);
    }
  }

  public pause(id?: number | undefined) {
    // console.log('Audio::pause() id', this.assetPath, id);
    return this.audio ? this.audio.pause(id) : false;
  }

  public seek(id?: number | undefined) {
    // console.log('Audio::seek()', this.assetPath, id);
    return this.audio ? this.audio.seek(id) : -1;
  }

  public playing(id?: number | undefined) {
    return this.audio ? this.audio.playing(id) : false;
  }

  public rate(id?: number | undefined) {
    return this.audio ? this.audio.rate(id) : 0;
  }

  public volume(idOrSetVolume: number) {
    return this.audio ? this.audio.volume(idOrSetVolume) : 0;
  }

  public setVolume(idOrSetVolume: number) {
    return this.audio ? this.audio.volume(idOrSetVolume) : 0;
  }
}
