import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as THREE from 'three';
import gsap from 'gsap';
import * as StackBlur from 'stackblur-canvas';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public title = 'wedding-app-3d';
  public isMobile: boolean = false;
  public isNavActive = false;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private mouseX = 0;
  private mouseY = 0;
  private cardGroup!: THREE.Group;
  private texturesLoaded = false;
  private shouldRotate = true; // Flag to control auto-rotation
  private particleSystem!: THREE.Points;
  private particles!: THREE.BufferGeometry;
  private particleMaterial!: THREE.ShaderMaterial;
  private textureLoader = new THREE.TextureLoader();
  private starTexture!: THREE.Texture;

  constructor(private route: ActivatedRoute, private router: Router, private el: ElementRef, private BreakpointObserver: BreakpointObserver, private loadingService: LoadingService) {}

  ngOnInit(): void {
    
    this.BreakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isMobile = result.matches;
    })
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.scrollToElement(fragment);
      }
    });
    this.loadingService.show();
    this.initThreeJS();
    this.starTexture = this.textureLoader.load('assets/white_circle.png'); 
    // this.addWindowResizeListener();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }
    // window.removeEventListener('resize', this.onWindowResize.bind(this));
  }

  toggleNav() {
    this.isNavActive = !this.isNavActive;
  }

  private initThreeJS(): void {
    this.setupRenderer();
    this.setupScene();
    this.setupCamera();
    this.setupLights();
    this.loadTextures();
  }

  private setupRenderer(): void {
    const canvas = this.el.nativeElement.querySelector('#c');
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.setRendererSize();
  }
  
  private setupScene(): void {
    this.scene = new THREE.Scene();
  }
  
  private setupCamera(): void {
    const canvas = this.renderer.domElement;
    const fov = 45;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const near = 0.1;
    const far = 100;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.z = window.innerWidth <= 768 ? 2.5 : 1.5;
  }
  
  private setupLights(): void {
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
  
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
  }
  
  private loadTextures(): void {
    const loadingManager = new THREE.LoadingManager(
      () => {
        this.texturesLoaded = true;
        this.loadingService.hide();
        this.animate();
      },
      (url, loaded, total) => {
        console.log(`Loading ${url}: ${loaded}/${total}`);
      },
      (url) => {
        console.error(`Failed to load ${url}`);
        // Handle error (e.g., load fallback texture)
      }
    );
  
    const loader = new THREE.TextureLoader(loadingManager);
    const frontTexture = loader.load('assets/images/front.png');
    const backTexture = loader.load('assets/images/back.png');
    backTexture.repeat.x = -1;
    backTexture.offset.x = 1;
    this.add3DCard(frontTexture, backTexture);
  }

  private add3DCard(frontTexture: THREE.Texture, backTexture: THREE.Texture): void {
    // Create a plane geometry for the card
    const cardGeometry = new THREE.PlaneGeometry(1, 1.5);

    // Create materials for the front and back
    const frontMaterial = new THREE.MeshBasicMaterial({
      map: frontTexture,
      side: THREE.FrontSide,
      transparent: true,
    });

    const backMaterial = new THREE.MeshBasicMaterial({
      map: backTexture,
      side: THREE.BackSide,
      transparent: true,
    });

    // Create meshes for the front and back
    const frontMesh = new THREE.Mesh(cardGeometry, frontMaterial);
    const backMesh = new THREE.Mesh(cardGeometry, backMaterial);

    // Position the back mesh behind the front mesh
    backMesh.position.z = -0.01;

    // Create a group to hold both front and back meshes
    this.cardGroup = new THREE.Group();
    this.cardGroup.add(frontMesh);
    this.cardGroup.add(backMesh);

    // Set renderOrder for the card (render last)
    this.cardGroup.renderOrder = 2;

    // Position the card group in the scene
    this.cardGroup.position.set(0, 0, -1);

    // Add the card group to the scene
    this.scene.add(this.cardGroup);
  }

  private addWindowResizeListener(): void {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private onWindowResize(): void {
    this.setRendererSize();
    this.camera.aspect = this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight;
    this.camera.updateProjectionMatrix();

     // Adjust camera position for mobile devices on resize
    const isMobile = window.innerWidth <= 768; // Check if the device is mobile
    this.camera.position.z = isMobile ? 2.5 : 1.5; // Zoom out for mobile devices
  }

  // private setRendererSize(): void {
  //   const width = window.innerWidth;
  //   const height = window.innerHeight;
  //   this.renderer.setSize(width, height, false);
  //   this.camera.aspect = width / height;
  //   this.camera.updateProjectionMatrix();
  // }


  private setRendererSize(): void {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const pixelRatio = window.devicePixelRatio;

    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(pixelRatio, 2));
  }

  private animate(): void {
    const render = (time: number) => {
      if (this.cardGroup && this.shouldRotate) {
        this.cardGroup.rotation.y += 0.01;
      }
  
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(render);
    };
  
    if (this.texturesLoaded) {
      requestAnimationFrame(render);
    }
  }

  scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}