import { Component, ElementRef, AfterViewInit } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-starry-sky',
  templateUrl: './starry-sky.component.html',
  styleUrls: ['./starry-sky.component.css']
})
export class StarrySkyComponent implements AfterViewInit {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private stars: THREE.Points[] = [];
  private mouseX = 0;
  private mouseY = 0;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createStars();
    this.animate();
  }

  private initThreeJS(): void {
    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;

    // Renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.el.nativeElement.appendChild(this.renderer.domElement);

    // Mouse move event
    window.addEventListener('mousemove', (event) => {
      this.mouseX = (event.clientX / window.innerWidth) * 10 - 1;
      this.mouseY = -(event.clientY / window.innerHeight) * 10 + 1;
    });
  }

  // private createStartNew(): void {
  //   var skyDomeRadius = 500.01;
  //   var sphereMaterial = new THREE.ShaderMaterial({
  //     uniforms: {
  //       skyRadius: { value: skyDomeRadius },
  //       env_c1: { value: new THREE.Color("#0d1a2f") },
  //       env_c2: { value: new THREE.Color("#0f8682") },
  //       noiseOffset: { value: new THREE.Vector3(100.01, 100.01, 100.01) },
  //       starSize: { value: 0.01 },
  //       starDensity: { value: 0.09 },
  //       clusterStrength: { value: 0.2 },
  //       clusterSize: { value: 0.2 },
  //     },
  //     vertexShader: StarrySkyShader.vertexShader,
  //     fragmentShader: StarrySkyShader.fragmentShader,
  //     side: THREE.DoubleSide,
  //   })
  //   var sphereGeometry = new THREE.SphereGeometry(skyDomeRadius, 20, 20);
  //   var skyDome = new THREE.Mesh(sphereGeometry, sphereMaterial);
  //   this.scene.add(skyDome);
  // }

  private createStars(): void {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      vertices.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 4 });
    const stars = new THREE.Points(geometry, material);
    this.scene.add(stars);
    this.stars.push(stars);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    // Move stars based on mouse position
    this.stars.forEach((star) => {
      star.rotation.x += this.mouseY * 0.0001;
      star.rotation.y += this.mouseX * 0.0001;
    });

    this.renderer.render(this.scene, this.camera);
  }
}