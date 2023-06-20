import '@imtbl/ig-animator';
import { html, LitElement } from 'lit';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import {
  customElement,
  eventOptions,
} from 'lit/decorators.js';
import './app.element.css';
import {
  ACESFilmicToneMapping,
  AmbientLight,
  AnimationClip,
  AnimationMixer,
  DefaultLoadingManager,
  DirectionalLight, EquirectangularReflectionMapping,
  GridHelper,
  LoopOnce,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry, PMREMGenerator,
  sRGBEncoding,
  TextureLoader,
  TorusKnotGeometry,
} from 'three';
import GUI from 'lil-gui';
import { IgAnimator } from '@imtbl/ig-animator';
import { gsap } from 'gsap';
import {TransformControls} from "three/examples/jsm/controls/TransformControls";
import {EXRLoader} from "three/examples/jsm/loaders/EXRLoader";
import {RGBMLoader} from "three/examples/jsm/loaders/RGBMLoader";

@customElement('app-root')
export class AppElement extends LitElement {
  private animatorRef: Ref<HTMLElement> = createRef();
  private mouse = { x: 0, y: 0 };
  private camera: any;

  private initPack = false;

  private config = {
    isEditing: false,
    isFollowing: false,
    cameraX: 0,
    cameraY: 0,
    cameraZ: 0,
    selectedX: 1150,
    selectedY: 645,
    selectedZ: 780,
    packX: 0,
    packY: 0,
    packZ: 0,
    packScaleX: 0,
    packScaleY: 0,
    packScaleZ: 0,
    packRotationX: 0,
    packRotationY: 0,
    packRotationZ: 0,
    exposure: 0.6,
    lightDirect: 20,
    lightAmbient: 44,
    selectPack: () => {
      this.selectPack();
    },
    openPack: () => {
      this.openPack();
    },
    reset: () => {
      this.resetPack();
    },
    selectedMesh: null,
    selectedModel: null,
    selectedPack: null,
  };

  @eventOptions({ passive: true })
  onLoaded(event) {
    // Start the background animation
    const guAnimator = event.detail.target;
    if (!guAnimator.controller) {
      console.warn('GU-Animator failed to initialize.');
      return;
    }
    // const background = guAnimator.getAnimationAsset('bg');
    // const timeline = background.meta.timeline;
    // timeline.repeat = -1;
    // timeline.play();

    document.addEventListener('mousemove', (e) => {
      const rect = guAnimator.getBoundingClientRect();
      const x = e.clientX - rect.left; //x position within the element.
      const y = e.clientY - rect.top; //y position within the element.
      this.mouse = { x, y };
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
    if(bg && bg.instance) {
      this.camera = bg.instance.animationData.layers.find(
        (layer) => layer.nm === 'Camera 1'
      );

      if (bg && bg.instance) {
        console.log('Animate the background', bg);
        bg.meta.timeline.play();

        bg.instance.animationData.layers.forEach((layer) => {
          console.log('BG layer', layer);
        });
      }
    }
    // anim.animationData.layers[0].ks.p.k[0]

    // const startX = camera.ks.p.k[0];
    // const startY = camera.ks.p.k[1];
    // const obj = {x: startX, y:startY, z:0};
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
      x: 0,
      y: 0,
    };
    function calculateSize() {
      windowW = window.innerWidth;
      windowH = window.innerHeight;
    }

    calculateSize();

    window.addEventListener('mousemove', (ev) => {
      mouseCoords.x = ev.clientX || ev.pageX;
      mouseCoords.y = ev.clientY || ev.pageY;
      theta = Math.atan2(
        windowH / 2 - mouseCoords.y,
        windowW / 2 - mouseCoords.x
      );

      dist =
        2 *
        Math.sqrt(
          Math.pow(mouseCoords.x - windowW / 2, 2) +
            Math.pow(mouseCoords.y - windowH / 2, 2)
        );
      dist = dist / 100;

      mousePos[0] = 960 + Math.cos(theta) * (dist * -1);
      mousePos[1] = 540 + Math.sin(theta) * dist;

      currentPos[0] = currentPos[0] + (mousePos[0] - currentPos[0]) * 0.25;
      currentPos[1] = currentPos[1] + (mousePos[1] - currentPos[1]) * 0.25 + 10;
      currentPos[2] = currentPos[2] + (mousePos[2] - currentPos[2]) * 0.25;

      if (this.config && this.config.isFollowing && this.camera) {
        this.config.cameraX = currentPos[0];
        this.config.cameraY = currentPos[1];

        // Pos x
        this.camera.ks.p.k[0].s[0] = currentPos[0];
        this.camera.ks.p.k[1].s[0] = currentPos[0];

        // Pos y
        this.camera.ks.p.k[0].s[1] = currentPos[1];
        this.camera.ks.p.k[1].s[1] = currentPos[1];
      }
    });
    //  console.log('Find camera', camera);

    // Setup pack
    if (!this.initPack) {
      this.initPack = true;

      // Init the dev tools
      const gui = new GUI();
      const editingController = gui.add(this.config, 'isEditing');
      editingController.onChange((value) => {
        if (value) {
          this.config.packX = this.config.selectedPack.scene.position.x;
          this.config.packY = this.config.selectedPack.scene.position.y;
          this.config.packZ = this.config.selectedPack.scene.position.z;
          this.config.packScaleX = this.config.selectedPack.scene.scale.x;
          this.config.packScaleY = this.config.selectedPack.scene.scale.y;
          this.config.packScaleZ = this.config.selectedPack.scene.scale.z;
          this.config.packRotationX = this.config.selectedPack.scene.rotation.x;
          this.config.packRotationY = this.config.selectedPack.scene.rotation.y;
          this.config.packRotationZ = this.config.selectedPack.scene.rotation.z;
        }
      });

      gui.add(this.config, 'isFollowing');
      gui.add(this.config, 'cameraX').listen();
      gui.add(this.config, 'cameraY').listen();
      gui.add(this.config, 'cameraZ').listen();
      gui.add(this.config, 'selectedX');
      gui.add(this.config, 'selectedY');
      gui.add(this.config, 'selectedZ');

      const packFolder = gui.addFolder('Pack');
      packFolder.add(this.config, 'packX').listen();
      packFolder.add(this.config, 'packY').listen();
      packFolder.add(this.config, 'packZ').listen();
      packFolder.add(this.config, 'packScaleX').listen();
      packFolder.add(this.config, 'packScaleY').listen();
      packFolder.add(this.config, 'packScaleZ').listen();
      packFolder.add(this.config, 'packRotationX').listen();
      packFolder.add(this.config, 'packRotationY').listen();
      packFolder.add(this.config, 'packRotationZ').listen();

      gui.add(this.config, 'selectPack');
      gui.add(this.config, 'openPack');
      gui.add(this.config, 'reset');

      const exposureController = gui.add(this.config, 'exposure'); // Number Field
      exposureController.onChange((value) => {
        if (threeData.renderer) {
          threeData.renderer.toneMappingExposure = this.config.exposure;
        }
      });
      const directController = gui.add(this.config, 'lightDirect'); // Number Field
      directController.onChange((value) => {
        if (threeData.directionalLight) {
          threeData.directionalLight.intensity = value;
        }
      });

      const ambientController = gui.add(this.config, 'lightAmbient'); // Number Field
      ambientController.onChange((value) => {
        if (threeData.ambientLight) {
          threeData.ambientLight.intensity = value;
        }
      });

      gui.onChange((changes) => {
        if (
          this.camera,
          changes.property === 'cameraX' ||
          changes.property === 'cameraY' ||
          changes.property === 'cameraZ'
        ) {
          if (changes.property === 'cameraX') {
            this.camera.ks.p.k[0].s[0] = changes.value;
            this.camera.ks.p.k[1].s[0] = changes.value;
          }
          if (changes.property === 'cameraY') {
            this.camera.ks.p.k[0].s[1] = changes.value;
            this.camera.ks.p.k[1].s[1] = changes.value;
          }
          if (changes.property === 'cameraZ') {
            this.camera.ks.p.k[0].s[2] = changes.value;
            this.camera.ks.p.k[1].s[2] = changes.value;
          }
        }
        if (
          this.config.selectedMesh &&
          (changes.property === 'selectedX' ||
            changes.property === 'selectedY' ||
            changes.property === 'selectedZ')
        ) {
          (this.config.selectedMesh as any).position.set(
            this.config.selectedX,
            this.config.selectedY,
            this.config.selectedZ
          );
        }

        if (
          this.config.isEditing &&
          this.config.selectedPack &&
          (changes.property === 'packX' ||
            changes.property === 'packY' ||
            changes.property === 'packZ' ||
            changes.property === 'packScaleX' ||
            changes.property === 'packScaleY' ||
            changes.property === 'packScaleZ')
        ) {
          (this.config.selectedPack as any).scene.position.set(
            this.config.packX,
            this.config.packY,
            this.config.packZ
          );
          (this.config.selectedPack as any).scene.scale.set(
            this.config.packScaleX,
            this.config.packScaleY,
            this.config.packScaleZ
          );
          (this.config.selectedPack as any).scene.rotation.set(
            this.config.packRotationX,
            this.config.packRotationY,
            this.config.packRotationZ
          );
        }
      });

      // const anim = bg.instance;
      const threeData = guAnimator.controller.getThree();

      const cardLoader = threeData.load('/assets/model/base_4_gold.gltf', (gltf) => {
        console.log('Loaded Cardback GLTF', gltf);

        this.config.selectedPack = gltf;
        const model = gltf.scene;
        model.scale.set(20, 20, 20);
        model.position.set(1219, 465, 2044);
        model.visible = true;
        threeData.scene.add(model);

        // Custom cardback
        // const textureURL = `/assets/cardback/1024/cardback_2006.png`;
        // const textureLoader = new TextureLoader();
        // const texture = textureLoader.load(textureURL);
        // texture.encoding = sRGBEncoding;
        // texture.flipY = false;
        // model.children[0].material.map = texture;

        // Control operations
        const control = new TransformControls(threeData.camera, threeData.renderer.domElement);
        control.addEventListener('change', () => {
          threeData.renderer.render(threeData.scene, threeData.camera);
        });
        control.attach(model.children[0]);
        threeData.scene.add(control);

        window.addEventListener( 'keydown', function ( event ) {

          switch ( event.keyCode ) {

            case 81: // Q
              control.setSpace( control.space === 'local' ? 'world' : 'local' );
              break;

            case 16: // Shift
              control.setTranslationSnap( 100 );
              control.setRotationSnap( MathUtils.degToRad( 15 ) );
              control.setScaleSnap( 0.25 );
              break;

            case 87: // W
              control.setMode( 'translate' );
              break;

            case 69: // E
              control.setMode( 'rotate' );
              break;

            case 82: // R
              control.setMode( 'scale' );
              break;

            // case 67: // C
            //   const position = currentCamera.position.clone();
            //
            //   currentCamera = currentCamera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
            //   currentCamera.position.copy( position );
            //
            //   orbit.object = currentCamera;
            //   control.camera = currentCamera;
            //
            //   currentCamera.lookAt( orbit.target.x, orbit.target.y, orbit.target.z );
            //   onWindowResize();
            //   break;

            case 86: { // V
              const randomFoV = Math.random() + 0.1;
              const randomZoom = Math.random() + 0.1;

              threeData.camera.fov = randomFoV * 160;
              threeData.camera.zoom = randomZoom * 5;
              break;
            }

            case 187:
            case 107: // +, =, num+
              control.setSize( control.size + 0.1 );
              break;

            case 189:
            case 109: // -, _, num-
              control.setSize( Math.max( control.size - 0.1, 0.1 ) );
              break;

            case 88: // X
              control.showX = ! control.showX;
              break;

            case 89: // Y
              control.showY = ! control.showY;
              break;

            case 90: // Z
              control.showZ = ! control.showZ;
              break;

            case 32: // Spacebar
              control.enabled = ! control.enabled;
              break;

            case 27: // Esc
              control.reset();
              break;
          }
        });

        window.addEventListener( 'keyup', function ( event ) {
          switch ( event.keyCode ) {
            case 16: // Shift
              control.setTranslationSnap( null );
              control.setRotationSnap( null );
              control.setScaleSnap( null );
              break;

          }
        });
      });

      // TODO: Load a gltf file..
      // loader.setCrossOrigin('anonymous');
      const loader = threeData.load('/assets/model/base_4_gold.gltf', (gltf) => {
        console.log('Loaded GLTF', gltf);
        this.config.selectedModel = gltf;
        this.config.selectedMesh = gltf.scene; // .children[0];

        const mesh = this.config.selectedMesh as any;
        mesh.scale.set(9, 9, 9);
        mesh.position.set(
          this.config.selectedX,
          this.config.selectedY,
          this.config.selectedZ
        );

        threeData.scene.add(gltf.scene);

        threeData.renderer.antialias = false;
        threeData.renderer.toneMappingExposure = this.config.exposure;
        threeData.renderer.toneMapping = ACESFilmicToneMapping;
        threeData.renderer.useLegacyLights = false;
        //
        const ambientLight = new AmbientLight(0x404040, this.config.lightAmbient);
        threeData.ambientLight = ambientLight;
        threeData.scene.add(ambientLight);

        const directionalLight = new DirectionalLight(0xffffff, this.config.lightDirect);
        directionalLight.position.set(1, 1, 1).normalize();
        threeData.directionalLight = directionalLight;
        threeData.scene.add(directionalLight);

        // Setup env mapping EXR
        let pngCubeRenderTarget, exrCubeRenderTarget;
        let pngBackground, exrBackground;
        let geometry: any = new TorusKnotGeometry( 18, 8, 150, 20 );
        let material: any = new MeshStandardMaterial( {
          metalness: 1,
          roughness: 0.04,
          envMapIntensity: 1
        });

        const torusMesh = new Mesh( geometry, material );
        torusMesh.position.x = 1000;
        torusMesh.scale.set(20, 20, 20);
        torusMesh.position.z = 5;
        threeData.scene.add( torusMesh );

        geometry = new PlaneGeometry( 2000, 2000 );
        material = new MeshBasicMaterial();

        const planeMesh = new Mesh( geometry, material );
        planeMesh.position.y = - 50;
        // planeMesh.rotation.x = - Math.PI * 0.5;
        threeData.scene.add( planeMesh );

        DefaultLoadingManager.onLoad = function ( ) {
          pmremGenerator.dispose();
        };

        const pmremGenerator = new PMREMGenerator( threeData.renderer );
        pmremGenerator.compileEquirectangularShader();

        const exrCubeMap = new EXRLoader().load( '/assets/textures/piz_compressed.exr', ( texture ) => {
       // const exrCubeMap = new EXRLoader().load( '/assets/textures/table_mountain.exr', ( texture ) => {
        // const exrCubeMap = new EXRLoader().load( '/assets/textures/satara_night.exr', ( texture ) => {

          texture.mapping = EquirectangularReflectionMapping;
          exrCubeRenderTarget = pmremGenerator.fromEquirectangular( texture );
          exrBackground = texture;

          torusMesh.material.envMap = exrCubeRenderTarget.texture;
          torusMesh.material.needsUpdate = true;

         //  this.config.selectedMesh.background = exrCubeMap;
          this.config.selectedMesh.children.forEach((mesh) => {
            mesh.material.toneMapped = true;
            mesh.material.envMapIntensity = 2;
            mesh.material.envMap = exrCubeRenderTarget.texture;
            mesh.material.needsUpdate = true;
          });

          // torusMesh.material.envMap = exrCubeRenderTarget;
          // torusMesh.material.needsUpdate = true;
          // threeData.scene.background = exrBackground;
          console.log('Finished loading EXR');
        });
        threeData.scene.background = exrCubeMap;
        threeData.scene.environment = exrCubeMap;

        // const pmremGenerator = new PMREMGenerator( threeData.renderer );
        // pmremGenerator.compileCubemapShader();
        // let rgbmCubeRenderTarget;
        // const rgbmUrls = [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ];
        // const rgbmCubeMap = new RGBMLoader().setMaxRange( 16 )
        //   .setPath( '/assets/textures/rgbm16/' )
        //   .loadCubemap( rgbmUrls, (textures) => {
        //     console.log('Cube map loaded', textures);
        //     rgbmCubeRenderTarget = pmremGenerator.fromCubemap( rgbmCubeMap );
        //
        //     torusMesh.material.envMap = rgbmCubeRenderTarget.texture;
        //     torusMesh.material.needsUpdate = true;
        //
        //     this.config.selectedMesh.background = rgbmCubeMap;
        //     this.config.selectedMesh.children.forEach((mesh) => {
        //       mesh.material.toneMapped = true;
        //       mesh.material.envMapIntensity = 2;
        //       mesh.material.envMap = rgbmCubeRenderTarget.texture;
        //       mesh.material.needsUpdate = true;
        //     });
        //     // torusMesh.material.needsUpdate = true;
        //     // this.three.scene.background = exrBackground;
        //   });
        // threeData.scene.background = rgbmCubeMap;
        // threeData.scene.environment = rgbmCubeMap;

        const generatedCubeRenderTarget = pmremGenerator.fromScene(threeData.scene);


        threeData.scene.add( new GridHelper( 2000, 10, 0x888888, 0x444444 ) );

        // Testing pack interaction
        const pack = gltf.scene.children[0];
        if (pack) {
          pack.material = pack.material.clone();
          pack.userData.initialEmissive = pack.material.emissive.clone();
          pack.material.emissiveIntensity = 0.5;

          threeData.interaction.add(pack);

          pack.addEventListener('mouseover', (event) => {
            console.log('Pack::mouseover()', event);
            document.body.style.cursor = 'pointer';

            if (pack.material) {
              pack.userData.materialEmissiveHex = pack.material.emissive.getHex();
              pack.material.emissive.setHex(0xff0000);
              pack.material.emissiveIntensity = 0.8;
            }
          });

          pack.addEventListener('mouseout', (event) => {
            console.log('Pack::mouseout()', event);
            document.body.style.cursor = 'default';

            if (pack.material) {
              pack.material.emissiveIntensity = 0;
            }
          });
        }

        // Add axes helper
        // const axesHelper = new THREE.AxesHelper(5);
        // threeData.scene.add(axesHelper);
        //
        // // Add camera helper (for perspective camera)
        // const cameraHelper = new THREE.CameraHelper(threeData.camera);
        // threeData.scene.add(cameraHelper);

        // const albedoTexture = new THREE.TextureLoader().load(`/assets/model/m2_pack_booster_albedo.png`);
        // const normalTexture = new THREE.TextureLoader().load(`/assets/model/m2_pack_booster_normal.png`);
        // const aoTexture = new THREE.TextureLoader().load(`/assets/model/m2_pack_booster_AO.png`);
        // const ormTexture = new THREE.TextureLoader().load(`/assets/model/m2_pack_booster_ORM.png`);
        // const emissiveTexture = new THREE.TextureLoader().load(`/assets/model/m2_pack_booster_emissive.png`);

        // this.three.scene.environment = diffuseCubemap;
        // const mat = new THREE.MeshPhysicalMaterial();
        // gltf.scene.children[0].children[0].material = mat;

        // mat.envMap = diffuseCubemap;
        // mat.map = albedoTexture;
        // mat.map.flipY = false;
        // mat.aoMap = aoTexture;
        // mat.aoMap.flipY = false;
        // mat.normalMap = normalTexture;
        // mat.normalMap.flipY = false;
        // mat.emissiveMap = emissiveTexture;
        // mat.emissiveMap.flipY = false;
        // mat.roughnessMap = ormTexture;
        // mat.roughnessMap.flipY = false;

        // mat.side = THREE.FrontSide;
        // mat.roughness = 2;
        // mat.needsUpdate = true;

        // Create TransformControls
        // const transformControls = new THREE.TransformControls(threeData.camera, threeData.renderer.domElement);
        // threeData.scene.add(transformControls);

        // // Add directional light helper
        //  const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
        // threeData.scene.add(directionalLightHelper);

        console.log('Loaded GLTF', gltf);

        // transformControls.attach(gltf.scene);

        // gltf.scene.children[0].children[0].material.wireframe = true;

        // Details of the KHR_materials_variants extension used here can be found below
        // https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_variants
        // const parser = gltf.parser;
        // const variantsExtension = gltf.userData.gltfExtensions[ 'KHR_materials_variants' ];
        // const variants = variantsExtension.variants.map( ( variant ) => variant.name );
        // const variantsCtrl = gui.add( state, 'variant', variants ).name( 'Variant' );
        //selectVariant( scene, parser, variantsExtension, state.variant );

        console.log('AnimatedMorphSphere::onLoaded', gltf);
        // variantsCtrl.onChange( ( value ) => selectVariant( scene, parser, variantsExtension, value ) );
        //
        // render();
      });
    }
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

    if (event.detail.marker.name === 'pack_openzz') {
      this.revealContents();
    }
  }

  firstUpdated() {
    const guAnimator: IgAnimator = this.animatorRef.value as IgAnimator;
    console.log('Demos::firstUpdated()', guAnimator, guAnimator.loadAnimation);

    // const animationPath = `https://images.godsunchained.com/pack-opening/animations/opening/gu-pack-opening/data.json`;
    const animationPath = '/assets/bg_camera/gu-data.json';
    guAnimator
      .loadAnimation(animationPath) // gu-pack-opening
      .then((response: any) => {
        console.log('GUAnimator::loadAnimation done', response);
        response.animations[0].instance.play();
      });
  }

  override render() {
    const title = 'GU Animator examples';
    return html`
      <div class="wrapper">
        <div class="container">
          <ig-animator
            ${ref(this.animatorRef)}
            @loaded=${this.onLoaded}
            @loading=${this.onLoading}
            @marker=${this.onMarker}
            @error=${this.onError}
          ></ig-animator>
        </div>
      </div>
    `;
  }

  private revealContents() {
    console.log('Demo::revealContents()');
    if (this.config.selectedPack) {
      this.config.selectedPack.scene.visible = true;
    }
  }

  private selectPack() {
    console.log('Demo::selectPack()', this.config.selectedModel);
    // TODO: Load a specific GLTF

    const mixer = new AnimationMixer(this.config.selectedModel.scene);
    const openClip = AnimationClip.findByName(
      this.config.selectedModel.animations,
      'Anim_0'
    );
    const openAction = mixer.clipAction(openClip);
    if (openAction) {
      openAction.clampWhenFinished = true;
      openAction.reset();
      openAction.play();
      openAction.loop = LoopOnce;

      // Play the animation via GSAP
      gsap.to(mixer, {
        _time: openClip.duration,
        duration: openClip.duration,
        onUpdateParams: [mixer],
        onUpdate: function (m) {
          const animProgress = openClip.duration * this['progress']();
          m.setTime(animProgress);
        },
      });
    }
  }

  private openPack(e?: any) {
    // MouseEvent || InteractionEvent

    // Open the pack
    const guAnimator = this.animatorRef.value as any;
    const pack = guAnimator.getAnimationAsset('pack');
    if (pack) {
      console.log('Found timeline', pack.meta.timeline);
      pack.meta.timeline.restart();
      pack.meta.timeline.play();
    }
  }

  private resetPack(e?: MouseEvent) {
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
