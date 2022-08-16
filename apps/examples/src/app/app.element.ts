import './app.element.scss';
import '@immutable/gu-animator';
import { html, LitElement } from 'lit';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import { customElement, eventOptions } from 'lit/decorators.js';
import { gsap, Power1 } from 'gsap';
import { PixiPlugin } from 'gsap/all';
import * as PIXI from 'pixi.js';
import { InteractionEvent, BLEND_MODES } from "pixi.js";
import { blendFullArray } from '@pixi/picture';

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

const customBlendModes = [blendFullArray[BLEND_MODES.LIGHTEN]];

// Scale mode for all textures, will retain pixelation
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

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

    const pack = guAnimator.getAnimationAsset('pack');
    const comp = pack.instance.renderer.elements.find((element) => element.data.nm === 'pack_break-up');
    if (comp) {
      this.home.x = comp.baseElement.x;
      this.home.y = comp.baseElement.y;
      comp.baseElement.interactive = true;
      comp.baseElement.buttonMode = true;
      comp.baseElement.on('pointerdown', (e) => {
        this.openPack(e);
      });
    }

    // Make stage interactive so you can click on it too
    const pixiApp = pack.instance.renderer.pixiApplication;
    pixiApp.stage.interactive = true;
    pixiApp.stage.hitArea = pixiApp.renderer.screen;

    // Hover animation
    const tlCan = gsap.timeline({repeat:-1, yoyo: true, paused: false});
    tlCan
      .to(comp.baseElement,{duration:6, x:'-=10', ease:Power1.easeInOut}, 0)
      .to(comp.baseElement,{duration:6, x:'+=10', ease:Power1.easeInOut}, 6)
      .to(comp.baseElement,{duration:4, x:'+=10', ease:Power1.easeInOut}, 12)
      .to(comp.baseElement,{duration:4, x:'+=10', ease:Power1.easeInOut}, 16)
      .to(comp.baseElement,{duration:3, y:'-=10', ease:Power1.easeInOut}, 0)
      .to(comp.baseElement,{duration:2, y:'+=10', ease:Power1.easeInOut}, 3)
      .to(comp.baseElement,{duration:3, y:'-=5', ease:Power1.easeInOut}, 5)
      .to(comp.baseElement,{duration:3, y:'+=5', ease:Power1.easeInOut}, 8)
      .to(comp.baseElement,{duration:3, y:'-=10', ease:Power1.easeInOut}, 11)
      .to(comp.baseElement,{duration:3, y:'+=10', ease:Power1.easeInOut}, 14)
      .to(comp.baseElement,{duration:2, y:'-=5', ease:Power1.easeInOut}, 17)
      .to(comp.baseElement,{duration:2, y:'+=5', ease:Power1.easeInOut}, 19);
  }

  @eventOptions({ passive: true })
  onLoading(event) {
    console.log('Examples loading:', event);
  }

  @eventOptions({ passive: true })
  onError(event) {
    console.log('Examples error:', event);
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
            @loaded=${this.onLoaded}
            @loading=${this.onLoading}
            @error=${this.onError}
          ></gu-animator>
        </div>
      </div>
    `;
  }

  private openPack(e: MouseEvent | InteractionEvent) {

    // Open the pack
    const guAnimator = this.animatorRef.value as any;
    const pack = guAnimator.getAnimationAsset('pack');
    if (pack) {
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
