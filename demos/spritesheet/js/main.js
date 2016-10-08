"use strict";

// MAIN
function main() {
	init();
	
	camera.position.set(0,150,400);
	camera.lookAt(scene.position);	

	var cube;
	var annie, boomer; // animators

	// LIGHT
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,250,0);
	scene.add(light);
	// FLOOR
	var floorTexture = new THREE.TextureLoader().load( "./textures/checkerboard.jpg" );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -0.5;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);
	// SKYBOX/FOG
	var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	// scene.add(skyBox);
	scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );

	// MESHES WITH ANIMATED TEXTURES
	var runnerTexture = new THREE.TextureLoader().load( "./textures/run.png" );
	annie = new spriteAnimator( runnerTexture, 10, 1, 10, 75 ); // texture, #horiz, #vert, #total, duration.
	sprites.push(annie);
	var runnerMaterial = new THREE.MeshBasicMaterial( { map: runnerTexture, side:THREE.DoubleSide } );
	runnerMaterial.transparent = true;
	var runnerGeometry = new THREE.PlaneGeometry(50, 50, 1, 1);
	var runner = new THREE.Mesh(runnerGeometry, runnerMaterial);
	runner.position.set(-100,25,0);
	scene.add(runner);

	//var explosionTexture = new THREE.TextureLoader().load( "./textures/explosion.jpg" );
	var explosionTexture = new THREE.TextureLoader().load( "./textures/fire_torch.png" );
	boomer = new spriteAnimator( explosionTexture, 7, 4, 28, 55 ); // texture, #horiz, #vert, #total, duration.
	//boomer = new spriteAnimator( explosionTexture, 4, 4, 16, 55 ); // texture, #horiz, #vert, #total, duration.
	sprites.push(boomer);
	var explosionMaterial = new THREE.MeshBasicMaterial( { map: explosionTexture } );
	explosionMaterial.transparent = true;
	explosionMaterial.blending = THREE.AdditiveBlending;
	var cubeGeometry = new THREE.CubeGeometry( 50, 50, 50 );
	cube = new THREE.Mesh( cubeGeometry, explosionMaterial );
	cube.position.set(0,26,0);
	scene.add(cube);

	function animate(timestamp) {
        updateSprites();

        render(timestamp);
        requestAnimationFrame(animate);
	}

    // Kick off animation loop
    animate(performance ? performance.now() : Date.now());
}

window.onload = main;