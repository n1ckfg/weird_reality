"use strict";

// SETUP
var renderer, scene, camera, controls, effect, clock, light;
var boxWidth, params, manager, lastRender;

var sprites = [];
var colliders = [];

var isWalking = false;
var isFlying = false;
var flyingThreshold = 0.15;
var movingSpeed = 0;
var movingSpeedMax = 0.25;
var movingDelta = 0.02;
var floor = 0;
var gravity = 0.01;
var cameraGaze;

function init() {
    // Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
    // Only enable it if you actually need to.
    renderer = new THREE.WebGLRenderer({antialias: false});
    renderer.setPixelRatio(window.devicePixelRatio);

    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

    controls = new THREE.VRControls(camera); // Apply VR headset positional data to camera.
    effect = new THREE.VREffect(renderer); // Apply VR stereo rendering to renderer.
    effect.setSize(window.innerWidth, window.innerHeight);

    clock = new THREE.Clock;

    // Create a VR manager helper to enter and exit VR mode.
    params = {
        hideButton: false, // Default: false.
        isUndistorted: false // Default: false.
    };

    manager = new WebVRManager(renderer, effect, params);

    // Request animation frame loop function
    lastRender = 0;
}

function render(timestamp) {
    var delta = Math.min(timestamp - lastRender, 500);
    lastRender = timestamp;

    // Update VR headset position and apply to camera.
    controls.update();

    // Render the scene through the manager.
    manager.render(scene, camera, timestamp);
}

// SPRITES
function spriteAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) {  
    // note: texture passed by reference, will be updated by the update function.
        
    this.tilesHorizontal = tilesHoriz;
    this.tilesVertical = tilesVert;
    // how many images does this spritesheet contain?
    //  usually equals tilesHoriz * tilesVert, but not necessarily,
    //  if there at blank tiles at the bottom of the spritesheet. 
    this.numberOfTiles = numTiles;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
    texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

    // how long should each image be displayed?
    this.tileDisplayDuration = tileDispDuration;

    // how long has the current image been displayed?
    this.currentDisplayTime = 0;

    // which image is currently being displayed?
    this.currentTile = 0;
        
    this.update = function( milliSec ) {
        this.currentDisplayTime += milliSec;
        while (this.currentDisplayTime > this.tileDisplayDuration) {
            this.currentDisplayTime -= this.tileDisplayDuration;
            this.currentTile++;
            if (this.currentTile == this.numberOfTiles)
                this.currentTile = 0;
            var currentColumn = this.currentTile % this.tilesHorizontal;
            texture.offset.x = currentColumn / this.tilesHorizontal;
            var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
            texture.offset.y = currentRow / this.tilesVertical;
        }
    };
}

function updateSprites() {
    var delta = clock.getDelta(); 
    for (var i=0; i<sprites.length; i++){
        sprites[i].update(1000 * delta);
    }
}