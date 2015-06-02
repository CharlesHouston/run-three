var renderer, scene, camera, controls;

var particles, pGeom, pMat;

var HSCALE = 5;
var VSCALE = 2;

var XMIN, XMAX, YMIN, YMAX, ZMIN, ZMAX;
var XRANGE, YRANGE, ZRANGE;

var pointSize = 0.05;

init();
render();

function init() {
    
    container = document.getElementById( 'container' );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 20000 );
    camera.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, 35 ) );
    camera.applyMatrix( new THREE.Matrix4().makeRotationX( -0.3 ) );

    controls = new THREE.OrbitControls( camera );
    controls.damping = 0.2;
    controls.addEventListener( 'change', render );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

    var ultraPts = getGPXPoints( "welsh_ultra_series_r2.gpx" );
    var maraPts = getGPXPoints( "london-mara.gpx" );

    processPoints( ultraPts, maraPts );

    pGeom = new THREE.Geometry();
    var color = new THREE.Color( Math.random() * 0x808080 + 0x808080 );

    ultraPts.forEach( function( p ) {

        pGeom.vertices.push( p );
        pGeom.colors.push( color );

    } );

    var pGeom2 = new THREE.Geometry();
    var color2 = new THREE.Color( Math.random() * 0x808080 + 0x808080 );

    maraPts.forEach( function( p ) {

        pGeom2.vertices.push( p );
        pGeom2.colors.push( color2 );

    } );

    pMat = new THREE.PointCloudMaterial( { vertexColors: THREE.VertexColors, size: pointSize } );

    particles = new THREE.PointCloud( pGeom, pMat );
    var particles2 = new THREE.PointCloud( pGeom2, pMat );
    scene.add( particles );
    scene.add( particles2 );

    animate();

}

function onWindowResize() {

    renderer.setSize( window.innerWidth, window.innerHeight );

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    render();

}

function animate() {

    requestAnimationFrame( animate );
    controls.update();

}

function render() {

    renderer.render( scene, camera );

}

function loadXMLDoc( XMLname ) {

    var xmlDoc;

    if( window.XMLHttpRequest ) {

        xmlDoc = new window.XMLHttpRequest();
        xmlDoc.open( 'GET', XMLname, false );
        xmlDoc.overrideMimeType( 'text/xml' );
        xmlDoc.send( '' );
        return xmlDoc.responseXML;

    } else if ( ActiveXObject( 'Microsoft.XMLDOM' ) ) {

        xmlDoc = new ActiveXObject( 'Microsoft.XMLDOM' );
        xmlDoc.async = false;
        xmlDoc.load( XMLname );
        return xmlDoc;
    
    } else {

        xmlhttp = new XMLHttpRequest();
        xmlhttp.open( 'GET', XMLname, false );
        xmlhttp.overrideMimeType( 'text/xml' );
        xmlhttp.send( null );
        return xmlDoc.responseXML;

    }

    alert( 'Error loading document!' );
    return null;

}

function getGPXPoints( filename ) {

    var xmlDoc = loadXMLDoc( filename );

    var trkpts = xmlDoc.getElementsByTagName( 'trkpt' );
    var elevations = xmlDoc.getElementsByTagName( 'ele' );
    var points = []

    for( var i = 0; i < trkpts.length; i++ ) {

        var pt = new THREE.Vector3();
        pt.x = parseFloat( trkpts[ i ].getAttribute( 'lat' ) );
        pt.z = parseFloat( trkpts[ i ].getAttribute( 'lon' ) );
        pt.y = parseFloat( elevations[ i ].childNodes[ 0 ].nodeValue );
        points.push( pt );

    }

    for( var i = 1; i < points.length; i++ ) {

        var dx = geoMeasure( points[ i ].x, points[ 0 ].z, points[ 0 ].x, points[ 0 ].z );
        var dz = geoMeasure( points[ 0 ].x, points[ i ].z, points[ 0 ].x, points[ 0 ].z );

        var dy = points[ i ].y - points[ 0 ].y;
        
        if( points[ i ].x > points[ 0 ].x ) {
            points[ i ].x = dx;
        } else {
            points[ i ].x = -dx;
        }

        if( points[ i ].z > points[ 0 ].z ) {
            points[ i ].z = dz;
        } else {
            points[ i ].z = -dz;
        }

        points[ i ].y = dy;

    }

    points[ 0 ].x = 0.0;
    points[ 0 ].y = 0.0;
    points[ 0 ].z = 0.0;

    return points;

}

function geoMeasure( lat1, lon1, lat2, lon2 ) {

    var R = 6378.137; // Radius of earth in km
    var dLat = ( lat2 - lat1 ) * Math.PI / 180;
    var dLon = ( lon2 - lon1 ) * Math.PI / 180;
    var a = Math.sin( dLat / 2 ) * Math.sin( dLat / 2 ) +
        Math.cos( lat1 * Math.PI / 180 ) * Math.cos( lat2 * Math.PI / 180 ) *
        Math.sin( dLon / 2 ) * Math.sin( dLon / 2 );

    var c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) );
    var d = R * c;

    return d * 1000; // Distance between in m

}

function processPoints() {

    // Finding the min and max values
    var xvals = [];
    var yvals = [];
    var zvals = [];

    for( var i = 0; i < arguments.length; i++ ) {

        var points = arguments[ i ];
       
        for( var j = 0; j < points.length; j++ ) {

            xvals.push( points[ j ].x );
            yvals.push( points[ j ].y );
            zvals.push( points[ j ].z );

        }

    }

    XMIN = Math.min.apply( null, xvals );
    XMAX = Math.max.apply( null, xvals );
    YMIN = Math.min.apply( null, yvals );
    YMAX = Math.max.apply( null, yvals );
    ZMIN = Math.min.apply( null, zvals );
    ZMAX = Math.max.apply( null, zvals );

    XRANGE = XMAX - XMIN;
    YRANGE = YMAX - YMIN;
    ZRANGE = ZMAX - ZMIN;

    for( var i = 0; i < arguments.length; i++ ) {

        arguments[ i ].forEach( function( p ) {

            var xnorm = 2 * ( p.x - XMIN ) / XRANGE - 1;
            p.x = HSCALE * xnorm;

            var ynorm = 2 * ( p.y - YMIN ) / YRANGE - 1;
            p.y = VSCALE * ynorm;

            var znorm = 2 * ( p.z - ZMIN ) / ZRANGE - 1;
            p.z = HSCALE * ZRANGE / XRANGE * znorm;

        } );

    }

}
