var page = require('webpage').create();
var _ = require('underscore');

var sawExpectedConsoleLogs = {
	"got customLibrary2: undefined" : false,
	"we got underscore!" : false
};

page.open('http://localhost:3000/page1', function( status ) {
	if( status !== "success" ) {
		console.log( "failed to load page: " + status );
		phantom.exit( 1 );
	}
});

page.onConsoleMessage = function(msg, lineNum, sourceId) {
	sawExpectedConsoleLogs[ msg ] = true;
};

setTimeout( function() {
	if( _.values( sawExpectedConsoleLogs ).indexOf( false ) !== -1 ) {
		console.log( "not everything we expected was console logged" );
		phantom.exit( 1 );
	}
	else {
		phantom.exit( 0 );
	}
}, 1000 );
