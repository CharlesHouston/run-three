( function() {

    var runMaker = new RunMaker();
    var fileDropArea = document.getElementById( 'drop_zone' );
    var fileUploadForm = document.getElementById( 'file-chooser' );
    var fileInput = document.getElementById( 'source-file' );

    fileDropArea.addEventListener( 'drop', dropFile, false );
    fileDropArea.addEventListener( 'dragover', cancel, false );
    fileDropArea.addEventListener( 'dragenter', cancel, false );
    fileDropArea.addEventListener( 'dragexit', cancel, false );
    fileUploadForm.addEventListener( 'submit', onSubmit, false );

    function dropFile( evt ) {

        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files;

        if( files.length ) {
            var extension = files[ 0 ].name.split( '.' ).pop().toLowerCase();
            if( extension === 'gpx' ) {
                go( files[ 0 ] );
            } else {
                alert( 'Only GPX files will work!' );
            }
        } 
    }

    function onSubmit( evt ) {

        evt.preventDefault();
        evt.stopImmediatePropagation();

        if( fileInput.files.length ) {
            var extension = fileInput.files[ 0 ].name.split( '.' ).pop().toLowerCase();
            if( extension === 'gpx' ) {
                go( fileInput.files[ 0 ] );
            } else {
                alert( 'Only GPX files will work!' );
            }
        } else {
            showExamples();
        }

    }

    function go( file ) {

        runMaker.makeRun( file );
        fileDropArea.classList.add( 'dropped' );

    }

    function showExamples() {

        runMaker.exampleRuns();
        fileDropArea.classList.add( 'dropped' );

    }

    function cancel( evt ) {

        evt.preventDefault();

    }

} )();


