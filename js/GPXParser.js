function GPXParser() {

    this.getPoints = function( file ) { 

        var trkpts = file.getElementsByTagName( 'trkpt' );
        var elevations = file.getElementsByTagName( 'ele' );
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

    };

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

}

