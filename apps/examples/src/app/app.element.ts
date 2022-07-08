import './app.element.scss';
import '@immutable/gu-animator';
import { html, LitElement } from 'lit';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import { customElement, eventOptions } from 'lit/decorators.js';
import { gsap, Power1 } from 'gsap';
import { PixiPlugin } from 'gsap/all';
import * as PIXI from 'pixi.js';
import { ObservablePoint } from "pixi.js";

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

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


    let forcex = 0;
    let forcey = 0;
    let magnet = 1500;

    document.addEventListener('mousemove', (e) => {
      const rect = guAnimator.getBoundingClientRect();
      const x = e.clientX - rect.left; //x position within the element.
      const y = e.clientY - rect.top;  //y position within the element.
      this.mouse = {x, y};
    });

    const pack = guAnimator.getAnimationAsset('pack');
    const comp = pack.instance.renderer.elements.find((element) => element.data.nm === 'pack_break-up');
    this.home.x = comp.baseElement.x;
    this.home.y = comp.baseElement.y;
    comp.baseElement.interactive = true;

    // Make stage interactive so you can click on it too
    const pixiApp = pack.instance.renderer.pixiApplication;
    pixiApp.stage.interactive = true;
    pixiApp.stage.hitArea = pixiApp.renderer.screen;

    // pixiApp.stage.addEventListener('click', (e) => {
    //   console.log('Pixi click', e);
    // });

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
      .to(comp.baseElement,{duration:2, y:'+=5', ease:Power1.easeInOut}, 19)

    // Repeal force
    // setInterval(() => {
    //   const x0 = comp.baseElement.x;
    //   const y0 = comp.baseElement.y;
    //   const x1 = this.mouse.x - (comp.baseElement.width * 0.5) - 30;
    //   const y1 = this.mouse.y - (comp.baseElement.height * 0.5) - 100;
    //   const distancex = x1-x0;
    //   const distancey = y1-y0;
    //   const distance = Math.sqrt((distancex * distancex) + (distancey * distancey));
    //
    //   magnet = 2600 - distance*20;
    //   if(distance>130) {
    //      magnet=0;
    //     tlCan.resume();
    //   } else {
    //
    //     tlCan.pause();
    //     const powerx = x0 - (distancex / distance) * magnet / distance;
    //     const powery = y0 - (distancey / distance) * magnet / distance;
    //     forcex = (forcex + (this.home.x - x0) / 2) / 2.1;
    //     forcey = (forcey + (this.home.y - y0) / 2) / 2.1;
    //     gsap.to(comp.baseElement, {
    //       duration : 0.5,
    //       x : powerx + forcex,
    //       y : powery + forcey,
    //       ease : Power1.easeInOut
    //     });
    //   }
    // }, 15);
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

  private openPack(e: MouseEvent) {

    // Open the pack
    const guAnimator = this.animatorRef.value as any;
    const pack = guAnimator.getAnimationAsset('pack');
    console.log('Found pack', pack);
    pack.meta.timeline.restart();
    pack.meta.timeline.play();
  }

  private resetPack(e: MouseEvent) {

    // Reset the pack
    const guAnimator = this.animatorRef.value as any;
    const pack = guAnimator.getAnimationAsset('pack');
    console.log('Reset pack', pack);
    pack.meta.timeline.restart();
    pack.meta.timeline.progress(0, true);
    pack.meta.timeline.pause();
  }
}
