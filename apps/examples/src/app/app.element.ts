import './app.element.scss';
import '@immutable/gu-animator';
import { html, LitElement } from 'lit';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import { customElement, eventOptions } from 'lit/decorators.js';
import { gsap, Power1 } from 'gsap';
// import { PixiPlugin } from 'gsap/all';
// import * as PIXI from 'pixi.js';
// import { InteractionEvent, BLEND_MODES } from "pixi.js";
// import { blendFullArray } from '@pixi/picture';

// gsap.registerPlugin(PixiPlugin);
// PixiPlugin.registerPIXI(PIXI);

// const customBlendModes = [blendFullArray[BLEND_MODES.LIGHTEN]];

// // Scale mode for all textures, will retain pixelation
// PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

@customElement('animator-examples')
export class AppElement extends LitElement {
  private animatorRef: Ref<HTMLElement> = createRef();
  private mouse = { x: 0, y: 0 };
  private home = { x: 980, y: 475 };

  @eventOptions({ passive: true })
  onLoaded(event) {

    // Start the background animation
    const guAnimator = event.detail.target;
    const background = guAnimator.getAnimationAsset('bg');
    const timeline = background.meta.timeline;
    timeline.repeat = -1;
    timeline.play();

    document.addEventListener('mousemove', (e) => {
      const rect = guAnimator.getBoundingClientRect();
      const x = e.clientX - rect.left; //x position within the element.
      const y = e.clientY - rect.top;  //y position within the element.
      this.mouse = {x, y};
    });

    // const pack = guAnimator.getAnimationAsset('pack');
    // console.log('Example animator pack', pack);
    // const comp = pack && pack.instance.renderer.elements.find((element) => element.data.nm === 'pack_break-up');
    // if (comp) {
    //   this.home.x = comp.baseElement.x;
    //   this.home.y = comp.baseElement.y;
    //   comp.baseElement.interactive = true;
    //   comp.baseElement.buttonMode = true;
    //   // comp.baseElement.on('pointerdown', (e) => {
    //   //   console.log('Pack hit');
    //   //   this.openPack(e);
    //   // });
    // }

    // pack.meta.timeline.addLabel('charlie', 1);
    // pack.meta.timeline.call((x, t) => {
    //   console.log('hit the frame', x, t.currentLabel());
    // }, ['charlie', pack.meta.timeline], 1);

    // Make stage interactive so you can click on it too
    // const pixiApp = pack.instance.renderer.pixiApplication;
    // pixiApp.stage.interactive = true;
    // pixiApp.stage.hitArea = pixiApp.renderer.screen;
    //
    // // Hover animation
    // const tlCan = gsap.timeline({repeat:-1, yoyo: true, paused: false});
    // tlCan
    //   .to(comp.baseElement,{duration:6, x:'-=10', ease:Power1.easeInOut}, 0)
    //   .to(comp.baseElement,{duration:6, x:'+=10', ease:Power1.easeInOut}, 6)
    //   .to(comp.baseElement,{duration:4, x:'+=10', ease:Power1.easeInOut}, 12)
    //   .to(comp.baseElement,{duration:4, x:'+=10', ease:Power1.easeInOut}, 16)
    //   .to(comp.baseElement,{duration:3, y:'-=10', ease:Power1.easeInOut}, 0)
    //   .to(comp.baseElement,{duration:2, y:'+=10', ease:Power1.easeInOut}, 3)
    //   .to(comp.baseElement,{duration:3, y:'-=5', ease:Power1.easeInOut}, 5)
    //   .to(comp.baseElement,{duration:3, y:'+=5', ease:Power1.easeInOut}, 8)
    //   .to(comp.baseElement,{duration:3, y:'-=10', ease:Power1.easeInOut}, 11)
    //   .to(comp.baseElement,{duration:3, y:'+=10', ease:Power1.easeInOut}, 14)
    //   .to(comp.baseElement,{duration:2, y:'-=5', ease:Power1.easeInOut}, 17)
    //   .to(comp.baseElement,{duration:2, y:'+=5', ease:Power1.easeInOut}, 19);

    const bg = guAnimator.getAnimationAsset('bg');
    const camera = bg.instance.animationData.layers.find((layer) => layer.nm === 'Camera 1');

    bg.instance.animationData.layers.forEach((layer) => {
      console.log('BG layer', layer);
    })
    // anim.animationData.layers[0].ks.p.k[0]

    const startX = camera.ks.p.k[0];
    const startY = camera.ks.p.k[1];
    const obj = {x: startX, y:startY, z:0};
    // gsap.to(obj, { duration: 5, x: startX + 100, y: startY + 100, onUpdate: () => {
    //     console.log('camera change x', obj.x, camera, bg.instance.renderer.camera);
    //     camera.ks.p.k[0].s[0] = obj.x;
    //     camera.ks.p.k[1].s[0] = obj.x;
    //
    //     // Pos y
    //     camera.ks.p.k[0].s[1] = obj.y;
    //     camera.ks.p.k[1].s[1] = obj.y;
    //     bg.instance.renderer.camera.renderFrame();
    // }});

    let theta;
    const currentPos = [960, 540, -2666.667];
    const mousePos = [960, 540, -2666.667];
    let windowW, windowH, dist;
    const mouseCoords = {
      x:0,
      y:0
    }
    function calculateSize(){
      windowW = window.innerWidth;
      windowH = window.innerHeight;
    }

    calculateSize();

    window.addEventListener('mousemove', function(ev){

      mouseCoords.x = (ev.clientX || ev.pageX);
      mouseCoords.y = ev.clientY || ev.pageY;
      theta = Math.atan2(
        windowH/2 - mouseCoords.y,
        windowW/2 - mouseCoords.x
      );

      dist = 2 * Math.sqrt(Math.pow(mouseCoords.x - windowW/2, 2) + Math.pow(mouseCoords.y - windowH/2, 2));
      dist = dist / 100;

      mousePos[0] = 960 + Math.cos(theta) * (dist * -1);
      mousePos[1] = 540 + Math.sin(theta )* (dist);

      currentPos[0] = currentPos[0] + (mousePos[0] - currentPos[0])*0.25;
      currentPos[1] = currentPos[1] + (mousePos[1] - currentPos[1])*0.25 + 10;
      currentPos[2] = currentPos[2] + (mousePos[2] - currentPos[2])*0.25;

      // Pos x
      camera.ks.p.k[0].s[0] = currentPos[0];
      camera.ks.p.k[1].s[0] = currentPos[0];

      // Pos y
      camera.ks.p.k[0].s[1] = currentPos[1];
      camera.ks.p.k[1].s[1] = currentPos[1];
    });
    console.log('Find camera', camera);
  }

  @eventOptions({ passive: true })
  onLoading(event) {
    console.log('Examples loading:', event);
  }

  @eventOptions({ passive: true })
  onError(event) {
    console.log('Examples error:', event);
  }

  @eventOptions({ passive: true })
  onMarker(event) {
    console.log('Examples marker:', event);
  }

  override render() {
    const title = 'GU Animator examples';
    return html`
      <div class="wrapper">
        <div class="container">
          <!--  WELCOME  -->
          <div id="welcome" style="margin-bottom:40px;">
            <h1>
              <span @click=${this.openPack}> Hello there, </span>
              <span @click=${this.resetPack}>Welcome</span> ${title} 👋
            </h1>
          </div>

          <gu-animator
            ${ref(this.animatorRef)}
            src="/assets/gu-animator-pack-opening/data.json"
            assetsPath="/assets/bg_camera/"
            @loaded=${this.onLoaded}
            @loading=${this.onLoading}
            @marker=${this.onMarker}
            @error=${this.onError}
          ></gu-animator>
        </div>
      </div>
    `;
  }

  private openPack(e: any) { // MouseEvent || InteractionEvent

    // Open the pack
    const guAnimator = this.animatorRef.value as any;
    const pack = guAnimator.getAnimationAsset('pack');
    if (pack) {
      console.log('Found timeline', pack.meta.timeline);
      pack.meta.timeline.restart();
      pack.meta.timeline.play();
    }
  }

  private resetPack(e: MouseEvent) {

    // Reset the pack
    const guAnimator = this.animatorRef.value as any;
    const pack = guAnimator.getAnimationAsset('pack');
    if (pack) {
      pack.meta.timeline.restart();
      pack.meta.timeline.progress(0, true);
      pack.meta.timeline.pause();
    }
  }
}
