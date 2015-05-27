var renderer, scene, camera;

var pointcloud;

var mouse = new THREE.Vector2();
var intersection = null;

var clock;

var threshold = 0.1;
var pointSize = 0.05;
var width = 150;
var length = 150;
var rotateY = new THREE.Matrix4().makeRotationY( 0.005 );

init();
animate();

function generatePointCloudGeometry( color, width, length ) {

    var geometry = new THREE.BufferGeometry();
    var numPoints = width*length;

    var positions = new Float32Array( numPoints*3 );
    var colors = new Float32Array( numPoints*3 );

    var k = 0;

    for( var i = 0; i < width; i++ ) {

        for( var j = 0; j < length; j++ ) {

            var u = i / width;
            var v = j / length;
            var x = u - 0.5;
            var y = ( Math.cos( u * Math.PI * 8 ) + Math.sin( v * Math.PI * 8 ) ) / 20;
            var z = v - 0.5;

            positions[ 3 * k ] = x;
            positions[ 3 * k + 1 ] = y;
            positions[ 3 * k + 2 ] = z;

            var intensity = ( y + 0.1 ) * 5;
            colors[ 3 * k ] = color.r * intensity;
            colors[ 3 * k + 1 ] = color.g * intensity;
            colors[ 3 * k + 2 ] = color.b * intensity;

            k++;

        }

    }

    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
    geometry.computeBoundingBox();

    return geometry;

}

function generatePointcloud( color, width, length ) {

    var geometry = generatePointCloudGeometry( color, width, length );
    
    var material = new THREE.PointCloudMaterial( { size: pointSize, vertexColors: THREE.VertexColors } );
    var pointcloud = new THREE.PointCloud( geometry, material );

    return pointcloud;

}

function generateRegularPointcloud( color, width, length ) {

    var geometry = new THREE.Geometry();
    var numPoints = width * length;

    var colors = [];

    var k = 0;

    for( var i = 0; i < width; i++ ) {

        for( var j = 0; j < length; j++ ) {

            var u = i / width;
            var v = j / length;
            var x = u - 0.5;
            var y = ( Math.cos( u * Math.PI * 8 ) + Math.sin( v * Math.PI * 8 ) ) / 20;
            var z = v - 0.5;
            var v = new THREE.Vector3( x, y, z );

            var intensity = ( y + 0.1 ) * 7;
            colors[ 3 * k ] = color.r * intensity;
            colors[ 3 * k + 1 ] = color.g * intensity;
            colors[ 3 * k + 2 ] = color.b * intensity;

            geometry.vertices.push( v );
            colors[ k ] = ( color.clone().multiplyScalar( intensity ) );

            k++;

        }

    }

    geometry.colors = colors;
    geometry.computeBoundingBox();

    var material = new THREE.PointCloudMaterial( { size: pointSize, vertexColor: THREE.VertexColors } );
    var pointcloud = new THREE.PointCloud( geometry, material );

    return pointcloud;

}

function onWindowResize() {

    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

}

function onDocumentMouseMove( event ) {

    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function init() {
    
    container = document.getElementById( 'container' );

    scene = new THREE.Scene();

    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, 20 ) );
    camera.applyMatrix( new THREE.Matrix4().makeRotationX( -0.5 ) );

    //
    
    pointcloud = generatePointcloud( new THREE.Color( 0, 1, 0 ), width, length );
    pointcloud.scale.set( 10, 10, 10 );
    scene.add( pointcloud );

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    //

    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );

}

function animate() {

    requestAnimationFrame( animate );

    render();

}

function render() {

    camera.applyMatrix( rotateY );
    camera.updateMatrixWorld();

    renderer.render( scene, camera );

}
