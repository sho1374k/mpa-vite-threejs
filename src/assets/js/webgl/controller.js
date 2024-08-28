import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import GUI from "three/examples/jsm/libs/lil-gui.module.min";

import { Stage } from "./stage";
import { Objects } from "./objects";

const FPS = 30;
export class Controller {
  constructor() {
    this.element = document.getElementById("webgl");

    this.resolution = {
      x: this.element.clientWidth,
      y: this.element.clientHeight,
      aspect: this.element.clientWidth / this.element.clientHeight,
      devicePixelRatio: Math.min(2, window.devicePixelRatio),
    };

    this.time = {
      now: 0,
      delta: 0,
      elapsed: 0,
    };

    this.fps = {
      lastTime: 0,
      frameCount: 0,
      startTime: null,
      nowTime: 0,
      limit: FPS,
      interval: 1000 / FPS,
    };

    this.controls = null;
    this.stats = null;
    this.gui = null;
    this.stage = new Stage(this.element, this.resolution);
    this.objects = new Objects(this.stage, this.resolution);

    window.addEventListener("resize", this.resize.bind(this), { passive: true });
  }

  resize() {
    this.resolution.x = this.element.clientWidth;
    this.resolution.y = this.element.clientHeight;
    this.resolution.aspect = this.resolution.x / this.resolution.y;

    this.stage.resize(this.resolution);
    this.objects.resize(this.resolution);
  }

  update(now) {
    requestAnimationFrame(this.update.bind(this));
    if (!this.fps.startTime) this.fps.startTime = now;
    this.time.now = now;
    const elapsed = now - this.fps.lastTime;
    this.time.elapsed = elapsed * 0.001;
    this.time.delta = (now - this.fps.startTime) * 0.001;

    if (elapsed > this.fps.interval) {
      this.fps.lastTime = now - (elapsed % this.fps.interval);
      this.fps.frameCount++;
      // console.log(this.fps.frameCount / this.time.delta); // fpsの値を確認する

      if (this.stats) this.stats.update();

      this.objects.update(this.time);
      this.stage.renderer.render(this.stage.scene, this.stage.camera);
    }
  }

  init() {
    this.stage.init();

    this.objects.init();

    this.update();
    this.resize();

    this.controls = new OrbitControls(this.stage.camera, this.stage.renderer.domElement);

    this.stats = new Stats();
    this.stats.domElement.style = `position: fixed; top: 0; left: 0; right: initial; bottom: initial; z-index: 9999; opacity: 0.5;`;
    document.body.appendChild(this.stats.domElement);

    this.gui = new GUI();
    {
      // scene
      const f = this.gui.addFolder("scene");
      f.addColor(this.stage.scene, "background");
    }
    {
      // cube mesh
      const f = this.gui.addFolder("cube");
      f.add(this.objects.cubeMesh.material.uniforms.uProgress, "value", 0, 1).name("progress");
    }
  }
}
