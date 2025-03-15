import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, AfterViewInit , ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as THREE from 'three';
import gsap from 'gsap';
import * as StackBlur from 'stackblur-canvas';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { LoadingService } from '../services/loading.service';
import { SwiperOptions } from 'swiper/types';
import Swiper from 'swiper';
import { Navigation, EffectCoverflow } from 'swiper/modules'
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {

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
  public images = [
    'assets/images/wed1.jpg',
    'assets/images/wed2.jpg',
    'assets/images/wed3.jpg',
    'assets/images/wed4.jpg',
    'assets/images/wed5.jpg',
    'assets/images/wed6.jpg',
    'assets/images/wed7.jpg',
    'assets/images/wed8.jpg',
    'assets/images/wed9.jpg',
    'assets/images/wed10.jpg',
  ];
  // public locationUrl = 'https://maps.app.goo.gl/HtKnU9PYRAJiCeou5'; 
  public locationUrl = 'https://www.google.com/maps/place/Vanessa+%7C+Wedding+Venue/@13.7150882,100.3089309,17z/data=!3m1!4b1!4m6!3m5!1s0x30e2959be89a8a95:0x366a3fd08017f0e1!8m2!3d13.715083!4d100.3115058!16s%2Fg%2F12hkzkwm_?coh=245189&entry=tts&g_ep=EgoyMDI1MDMxMS4wIPu8ASoJLDEwMjExNDU1SAFQAw%3D%3D';
  public qrCodeImage = 'assets/images/qrcode.png'; 
  public mapImage = 'assets/images/map_place.png'; 

  timelineItems = [
    {
      time: '07:00 น.',
      title: 'พิธีสงฆ์',
      description: 'ร่วมกันฟังพระสวด ให้พรเพื่อเป็นสิริมงคล',
      icon: 'assets/icon/schedule2.png'
    },
    {
      time: '09:09 น.',
      title: 'พิธีแห่ขันหมาก',
      description: 'เดินขบวนแห่ขันหมาก เพื่อแสดงความจริงใจ',
      icon: 'assets/icon/schedule1.png'
    },
    {
      time: '10.00 น.',
      title: 'พิธีหลั่งน้ำ',
      description: 'ร่วมกันรดน้ำสังข์ เพื่ออวยพรบ่าวสาว',
      icon: 'assets/icon/schedule3.png'
    },
    {
      time: '11.00 น.',
      title: 'รับประทานอาหาร',
      description: 'ร่วมกันรับประทานอาหาร บุฟเฟ่ด์โต๊ะจีน',
      icon: 'assets/icon/schedule4.png'
    }
  ];

  constructor(private route: ActivatedRoute, private router: Router, private el: ElementRef, private BreakpointObserver: BreakpointObserver, private loadingService: LoadingService) {}

  ngOnInit(): void {
    
    this.initSwiper();
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

  initSwiper(): void {
    Swiper.use([Navigation, EffectCoverflow]);

    new Swiper('.swiper-container', {
      effect: 'coverflow',
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      coverflowEffect: {
        rotate: 30,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
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