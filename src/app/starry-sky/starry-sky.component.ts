import { Component, ElementRef, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-starry-sky',
  templateUrl: './starry-sky.component.html',
  styleUrls: ['./starry-sky.component.css']
})
export class StarrySkyComponent implements OnInit, OnDestroy {
  private renderer!: THREE.WebGLRenderer;
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private starsT1!: THREE.Points;
    private starsT2!: THREE.Points;
    private mouseX = 0;
    private mouseY = 0;
  
    constructor(private el: ElementRef) {}
  
    ngOnInit(): void {
      this.initThreeJS();
      this.animate();
      this.addMouseMoveListener();
    }
  
    ngOnDestroy(): void {
      // Clean up the renderer and any other resources
      if (this.renderer) {
        this.renderer.dispose();
      }
    }
  
    private initThreeJS(): void {
      const canvas = this.el.nativeElement.querySelector('#c');
  
      // Renderer
      this.renderer = new THREE.WebGLRenderer({ canvas });
      this.renderer.setClearColor(new THREE.Color('#1c1624'));
  
      // Scene
      this.scene = new THREE.Scene();
  
      // Light
      const color = 0xffffff;
      const intensity = 1;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(-1, 2, 4);
      this.scene.add(light);
  
      // Camera
      const fov = 75,
        aspect = 2,
        near = 1.5,
        far = 5;
      this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      this.camera.position.z = 2;
  
      // Geometries
      const geometrys = [new THREE.BufferGeometry(), new THREE.BufferGeometry()];
      geometrys[0].setAttribute('position', new THREE.BufferAttribute(this.getRandomParticlePos(350), 3));
      geometrys[1].setAttribute('position', new THREE.BufferAttribute(this.getRandomParticlePos(1500), 3));
  
      // Texture Loader
      const loader = new THREE.TextureLoader();
  
      // Materials
      const materials = [
        new THREE.PointsMaterial({
          size: 0.05,
          map: loader.load('assets/sp1.png'),
          transparent: true,
        }),
        new THREE.PointsMaterial({
          size: 0.075,
          map: loader.load('assets/sp2.png'),
          transparent: true,
        }),
      ];
  
      // Points
      this.starsT1 = new THREE.Points(geometrys[0], materials[0]);
      this.starsT2 = new THREE.Points(geometrys[1], materials[1]);
      this.scene.add(this.starsT1);
      this.scene.add(this.starsT2);
    }
  
    private getRandomParticlePos(particleCount: number): Float32Array {
      const arr = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        arr[i] = (Math.random() - 0.5) * 10;
      }
      return arr;
    }
  
    private resizeRendererToDisplaySize(): boolean {
      const canvas = this.renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
      }
      return needResize;
    }
  
    private addMouseMoveListener(): void {
      document.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
      });
    }
  
    private animate(): void {
      const render = (time: number) => {
        if (this.resizeRendererToDisplaySize()) {
          const canvas = this.renderer.domElement;
          this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
          this.camera.updateProjectionMatrix();
        }
  
        this.starsT1.position.x = this.mouseX * 0.0001;
        this.starsT1.position.y = this.mouseY * -0.0001;
  
        this.starsT2.position.x = this.mouseX * 0.0001;
        this.starsT2.position.y = this.mouseY * -0.0001;
  
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(render);
      };
      requestAnimationFrame(render);
    }
}