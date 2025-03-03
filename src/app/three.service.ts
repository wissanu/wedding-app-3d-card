import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
  }

  initialize(canvas: HTMLCanvasElement): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    canvas.appendChild(this.renderer.domElement);

    // Set up camera
    this.camera.position.z = 5;

    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  createPlaneFromImages(frontImagePath: string, backImagePath: string): void {
    const textureLoader = new THREE.TextureLoader();

    // Load front and back textures
    const frontTexture = textureLoader.load(frontImagePath);
    const backTexture = textureLoader.load(backImagePath);

    // Create materials for front and back
    const frontMaterial = new THREE.MeshBasicMaterial({ map: frontTexture });
    const backMaterial = new THREE.MeshBasicMaterial({ map: backTexture });

    // Create a plane geometry
    const geometry = new THREE.PlaneGeometry(2, 2); // Adjust width and height as needed

    // Create front and back planes
    const frontPlane = new THREE.Mesh(geometry, frontMaterial);
    const backPlane = new THREE.Mesh(geometry, backMaterial);

    // Position the back plane behind the front plane
    backPlane.rotation.y = Math.PI; // Rotate 180 degrees to show the back
    backPlane.position.z = -0.01; // Slightly behind the front plane

    // Add planes to the scene
    this.scene.add(frontPlane);
    this.scene.add(backPlane);
  }
}