"use strict";

/**
 * @author mrdoob / http://mrdoob.com
 * @modified by obviousjim / http://specular.cc
 * @modified by n1ckfg / http://fox-gieg.com
 */

function main() {

    // SETUP
    var renderer, scene, camera, controls, effect, clock, light;
    var boxWidth, params, manager, lastRender;
    var angle, videos, objects;

    function init() {
        // Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
        // Only enable it if you actually need to.
        renderer = new THREE.WebGLRenderer({antialias: false});
        renderer.setPixelRatio(window.devicePixelRatio);

        document.body.appendChild(renderer.domElement);

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    	camera.position.set(0,100,-400);//0,150,400);
    	camera.lookAt(scene.position);	

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


    	angle = ( Math.PI * 2 ) / VideoFiles.length;
    	videos = [];
    	objects = [];

    	var geometry = new THREE.IcosahedronGeometry( 400, 0 );

    	for ( var i = 0; i < VideoFiles.length; i++ ) {
    		var video = new RGBDVideo( VideoFiles[i] );
    		video.position.x = Math.sin( i * angle ) * 800;
    		video.position.z = Math.cos( i * angle ) * 800;
    		video.rotation.y = i * angle;

    		scene.add( video );
    		videos.push( video );

    		var sphere = new THREE.Mesh( geometry );
    		sphere.position.x = Math.sin( i * angle ) * 500;
    		sphere.position.y = -100;
    		sphere.position.z = Math.cos( i * angle ) * 500;
    		sphere.updateMatrix();
    		sphere.updateMatrixWorld();

    		objects.push( sphere );

    		sphere.material.opacity = 0.75;
    	}
    }

    function render(timestamp) {
        var delta = Math.min(timestamp - lastRender, 500);
        lastRender = timestamp;

        // Update VR headset position and apply to camera.
        controls.update();

        // Render the scene through the manager.
        manager.render(scene, camera, timestamp);
    }

    function animate(timestamp) {
        render(timestamp);
        requestAnimationFrame(animate);
    }

    // Kick off animation loop
    init();
    animate(performance ? performance.now() : Date.now());

}

window.onload = main;



