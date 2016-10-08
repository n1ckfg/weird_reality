"use strict";

function VrVideoViewer(_filePath, _stereoMode) {

	var camera, scene, renderer, clock;
	var effect, controls;
	var params, manager, lastRender;

	var filePath = _filePath;
	var stereoMode = _stereoMode.toLowerCase();

	var textureL, textureR;
	var materialL, materialR;
	var sphere, video, light, mesh;

    renderer = new THREE.WebGLRenderer({antialias: false});
    renderer.setPixelRatio(window.devicePixelRatio);

    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();

	sphere = new THREE.SphereGeometry(500, 60, 40);
	sphere.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));

	video = document.createElement("video"); 
	video.setAttribute('crossorigin', 'anonymous');
	//video.width = 640;
	//video.height = 360;
	video.autoplay = true;
	video.loop = true;
	video.src = filePath;
	video.load();

	function bindPlay () {
		video.play();
		document.body.removeEventListener("click", bindPlay);
	}
	document.body.addEventListener("click", bindPlay, false);


    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 10, 0);
    scene.add(camera);

    textureL = new THREE.VideoTexture(video);
	textureL.minFilter = THREE.LinearFilter;
    //textureL.wrapS = THREE.RepeatWrapping;
    //textureL.wrapT = THREE.RepeatWrapping;
    //textureL.repeat = new THREE.Vector2(50, 50);
    textureL.anisotropy = renderer.getMaxAnisotropy();

    textureR = new THREE.VideoTexture(video);
	textureR.minFilter = THREE.LinearFilter;
    textureR.anisotropy = renderer.getMaxAnisotropy();

	setStereoMode(stereoMode, textureL, textureR);

    /*
   	var material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0xffffff,
        shininess: 20,
        shading: THREE.FlatShading,
        map: texture
    });
	*/
	materialL = new THREE.MeshBasicMaterial({ map : textureL });
	materialR = new THREE.MeshBasicMaterial({ map : textureR });

    //var geometry = new THREE.PlaneGeometry(1000, 1000);

    mesh = new THREE.Mesh(sphere, materialL);
    //mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.y += -20.4;
    scene.add(mesh);

	// ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ 
	 /*
	 * @author dmarcos / https://github.com/dmarcos
	 * @author mrdoob / http://mrdoob.com
	 *
	 * WebVR Spec: http://mozvr.github.io/webvr-spec/webvr.html
	 *
	 * Firefox: http://mozvr.com/downloads/
	 * Chromium: https://drive.google.com/folderview?id=0BzudLt22BqGRbW9WTHMtOWMzNjQ&usp=sharing#list
	 */

	THREE.VREffect = function ( renderer, onError ) {

		var vrHMD;
		var eyeTranslationL, eyeFOVL;
		var eyeTranslationR, eyeFOVR;

		function gotVRDevices( devices ) {
			for ( var i = 0; i < devices.length; i ++ ) {
				if ( devices[ i ] instanceof HMDVRDevice ) {
					vrHMD = devices[ i ];
					if ( vrHMD.getEyeParameters !== undefined ) {
						var eyeParamsL = vrHMD.getEyeParameters( 'left' );
						var eyeParamsR = vrHMD.getEyeParameters( 'right' );
						eyeTranslationL = eyeParamsL.eyeTranslation;
						eyeTranslationR = eyeParamsR.eyeTranslation;
						eyeFOVL = eyeParamsL.recommendedFieldOfView;
						eyeFOVR = eyeParamsR.recommendedFieldOfView;
					} else {
						// TODO: This is an older code path and not spec compliant.
						// It should be removed at some point in the near future.
						eyeTranslationL = vrHMD.getEyeTranslation( 'left' );
						eyeTranslationR = vrHMD.getEyeTranslation( 'right' );
						eyeFOVL = vrHMD.getRecommendedEyeFieldOfView( 'left' );
						eyeFOVR = vrHMD.getRecommendedEyeFieldOfView( 'right' );
					}

					break; // We keep the first we encounter
				}
			}

			if ( vrHMD === undefined ) {
				if ( onError ) onError( 'HMD not available' );
			}
		}

		if ( navigator.getVRDevices ) {
			navigator.getVRDevices().then( gotVRDevices );
		}

		this.scale = 1;

		this.setSize = function( width, height ) {
			renderer.setSize( width, height );
		};

		// fullscreen
		var isFullscreen = false;

		var canvas = renderer.domElement;
		var fullscreenchange = canvas.mozRequestFullScreen ? 'mozfullscreenchange' : 'webkitfullscreenchange';

		document.addEventListener( fullscreenchange, function ( event ) {
			isFullscreen = document.mozFullScreenElement || document.webkitFullscreenElement;
		}, false );

		this.setFullScreen = function ( boolean ) {
			if ( vrHMD === undefined ) return;
			if ( isFullscreen === boolean ) return;

			if ( canvas.mozRequestFullScreen ) {
				canvas.mozRequestFullScreen( { vrDisplay: vrHMD } );
			} else if ( canvas.webkitRequestFullscreen ) {
				canvas.webkitRequestFullscreen( { vrDisplay: vrHMD } );
			}
		};

		// render
		var cameraL = new THREE.PerspectiveCamera();
		var cameraR = new THREE.PerspectiveCamera();

		this.render = function ( scene, camera ) {
			if ( vrHMD ) {
				var sceneL, sceneR;
				if ( Array.isArray( scene ) ) {
					sceneL = scene[ 0 ];
					sceneR = scene[ 1 ];
				} else {
					sceneL = scene;
					sceneR = scene;
				}

				var size = renderer.getSize();
				size.width /= 2;

				renderer.enableScissorTest( true );
				renderer.clear();

				if ( camera.parent === null ) camera.updateMatrixWorld();

				cameraL.projectionMatrix = fovToProjection( eyeFOVL, true, camera.near, camera.far );
				cameraR.projectionMatrix = fovToProjection( eyeFOVR, true, camera.near, camera.far );

				camera.matrixWorld.decompose( cameraL.position, cameraL.quaternion, cameraL.scale );
				camera.matrixWorld.decompose( cameraR.position, cameraR.quaternion, cameraR.scale );

				cameraL.translateX( eyeTranslationL.x * this.scale );
				cameraR.translateX( eyeTranslationR.x * this.scale );

				// render left eye
				renderer.setViewport( 0, 0, size.width, size.height );
				renderer.setScissor( 0, 0, size.width, size.height );
				// * * * * *
				mesh.material = materialL;
				// * * * * *
				renderer.render( sceneL, cameraL );

				// render right eye
				renderer.setViewport( size.width, 0, size.width, size.height );
				renderer.setScissor( size.width, 0, size.width, size.height );
				// * * * * *
				mesh.material = materialR;
				// * * * * *
				renderer.render( sceneR, cameraR );

				renderer.enableScissorTest( false );

				return;
			}

			// Regular render mode if not HMD
			if ( Array.isArray( scene ) ) scene = scene[ 0 ];

			renderer.render( scene, camera );
		};

		function fovToNDCScaleOffset( fov ) {
			var pxscale = 2.0 / ( fov.leftTan + fov.rightTan );
			var pxoffset = ( fov.leftTan - fov.rightTan ) * pxscale * 0.5;
			var pyscale = 2.0 / ( fov.upTan + fov.downTan );
			var pyoffset = ( fov.upTan - fov.downTan ) * pyscale * 0.5;
			return { scale: [ pxscale, pyscale ], offset: [ pxoffset, pyoffset ] };
		}

		function fovPortToProjection( fov, rightHanded, zNear, zFar ) {
			rightHanded = rightHanded === undefined ? true : rightHanded;
			zNear = zNear === undefined ? 0.01 : zNear;
			zFar = zFar === undefined ? 10000.0 : zFar;

			var handednessScale = rightHanded ? - 1.0 : 1.0;

			// start with an identity matrix
			var mobj = new THREE.Matrix4();
			var m = mobj.elements;

			// and with scale/offset info for normalized device coords
			var scaleAndOffset = fovToNDCScaleOffset( fov );

			// X result, map clip edges to [-w,+w]
			m[ 0 * 4 + 0 ] = scaleAndOffset.scale[ 0 ];
			m[ 0 * 4 + 1 ] = 0.0;
			m[ 0 * 4 + 2 ] = scaleAndOffset.offset[ 0 ] * handednessScale;
			m[ 0 * 4 + 3 ] = 0.0;

			// Y result, map clip edges to [-w,+w]
			// Y offset is negated because this proj matrix transforms from world coords with Y=up,
			// but the NDC scaling has Y=down (thanks D3D?)
			m[ 1 * 4 + 0 ] = 0.0;
			m[ 1 * 4 + 1 ] = scaleAndOffset.scale[ 1 ];
			m[ 1 * 4 + 2 ] = - scaleAndOffset.offset[ 1 ] * handednessScale;
			m[ 1 * 4 + 3 ] = 0.0;

			// Z result (up to the app)
			m[ 2 * 4 + 0 ] = 0.0;
			m[ 2 * 4 + 1 ] = 0.0;
			m[ 2 * 4 + 2 ] = zFar / ( zNear - zFar ) * - handednessScale;
			m[ 2 * 4 + 3 ] = ( zFar * zNear ) / ( zNear - zFar );

			// W result (= Z in)
			m[ 3 * 4 + 0 ] = 0.0;
			m[ 3 * 4 + 1 ] = 0.0;
			m[ 3 * 4 + 2 ] = handednessScale;
			m[ 3 * 4 + 3 ] = 0.0;

			mobj.transpose();

			return mobj;
		}

		function fovToProjection( fov, rightHanded, zNear, zFar ) {

			var DEG2RAD = Math.PI / 180.0;

			var fovPort = {
				upTan: Math.tan( fov.upDegrees * DEG2RAD ),
				downTan: Math.tan( fov.downDegrees * DEG2RAD ),
				leftTan: Math.tan( fov.leftDegrees * DEG2RAD ),
				rightTan: Math.tan( fov.rightDegrees * DEG2RAD )
			};

			return fovPortToProjection( fovPort, rightHanded, zNear, zFar );

		}

	};

	// ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ 
	controls = new THREE.VRControls(camera);
	effect = new THREE.VREffect(renderer);
	effect.setSize(window.innerWidth, window.innerHeight);

	clock = new THREE.Clock();

    light = new THREE.HemisphereLight(0x777777, 0x000000, 0.6);
    scene.add(light);

    params = {
            hideButton: false,
            isUndistorted: false
    };

    manager = new WebVRManager(renderer, effect, params);

    lastRender = 0;

    function animate(timestamp) {
            var delta = Math.min(timestamp - lastRender, 500);
            lastRender = timestamp;

            controls.update();

            manager.render(scene, camera, timestamp);

            requestAnimationFrame(animate);
    }

	function setStereoMode(_sm, _texL, _texR) {
		if (_sm == "lr") {
			_texL.repeat.x = 0.5;
			_texL.repeat.y = 1.0;
			_texL.offset.x = 0.0;
			_texL.offset.y = 0.0;
			// ~~
			_texR.repeat.x = 0.5;
			_texR.repeat.y = 1.0;
			_texR.offset.x = 0.5;
			_texR.offset.y = 0.0;
		} else if (_sm=="rl") {
			_texL.repeat.x = 0.5;
			_texL.repeat.y = 1.0;
			_texL.offset.x = 0.5;
			_texL.offset.y = 0.0;
			// ~~
			_texR.repeat.x = 0.5;
			_texR.repeat.y = 1.0;
			_texR.offset.x = 0.0;
			_texR.offset.y = 0.0;			
		} else if (_sm=="tb") {
			_texL.repeat.x = 1.0;
			_texL.repeat.y = 0.5;
			_texL.offset.x = 0.0;
			_texL.offset.y = 0.5;
			// ~~
			_texR.repeat.x = 1.0;
			_texR.repeat.y = 0.5;
			_texR.offset.x = 0.0;
			_texR.offset.y = 0.0;
		} else if (_sm=="bt") {
			_texL.repeat.x = 1.0;
			_texL.repeat.y = 0.5;
			_texL.offset.x = 0.0;
			_texL.offset.y = 0.0;
			// ~~
			_texR.repeat.x = 1.0;
			_texR.repeat.y = 0.5;
			_texR.offset.x = 0.0;
			_texR.offset.y = 0.5;
		} else {
			_texL.repeat.x = 1.0;
			_texL.repeat.y = 1.0;
			_texL.offset.x = 0.0;
			_texL.offset.y = 0.0;
			// ~~
			_texR.repeat.x = 1.0;
			_texR.repeat.y = 1.0;
			_texR.offset.x = 0.0;
			_texR.offset.y = 0.0;
		}
	}

    animate(performance ? performance.now() : Date.now());

}



