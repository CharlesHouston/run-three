var renderer, scene, camera;

var clock;

var particles, pGeom, pMat;

var pointSize = 0.2;
var NUMX = 30;
var NUMY = 30;
var WIDTH = 15;
var LENGTH = 15;

var rotateY = new THREE.Matrix4().makeRotationY( 0.005 );

init();
animate();

function init() {
    
    container = document.getElementById( 'container' );

    scene = new THREE.Scene();

    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 20000 );
    camera.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, 20 ) );
    camera.applyMatrix( new THREE.Matrix4().makeRotationX( -0.5 ) );

    pGeom = new THREE.Geometry();

    for( var i = 0; i < NUMX; i++ ) {

        for( var j = 0; j < NUMY; j++ ) {

            var u = i / NUMX * WIDTH - WIDTH / 2;
            var v = j / NUMY * LENGTH - LENGTH / 2;

            var particle = new THREE.Vector3( u, 0, v );

            var color = new THREE.Color();
            color.setHSL( particle.y / 5, 1.0, 0.5 );

            pGeom.vertices.push( particle );
            pGeom.colors.push( color );

        }

    }

    pMat = new THREE.PointCloudMaterial( { vertexColors: THREE.VertexColors, size: pointSize, transparent: true, opacity: 0.8 } );

    particles = new THREE.PointCloud( pGeom, pMat );
    scene.add( particles );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

}

function animate() {

    requestAnimationFrame( animate );

    for( var i = 0; i < pGeom.vertices.length; i++ ) {

        var v = pGeom.vertices[ i ];
        v.y = 0.5 * Math.sin( clock.getElapsedTime() + v.x ) + 0.5 * Math.cos( clock.getElapsedTime() + v.z );

        var c = pGeom.colors[ i ];
        c.setHSL( v.y / 5, 1.0, 0.5 );

    }

    pGeom.verticesNeedUpdate = true;
    pGeom.colorsNeedUpdate = true;
   
    render();

}

function render() {

    camera.applyMatrix( rotateY );
    camera.updateMatrixWorld();

    renderer.render( scene, camera );

}
