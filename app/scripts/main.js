var myData;
// cache dom
var $wikiText = $( '#text' );
var $wikiImage = $( '#img' );
// bulding the url
var mediaTitle = "The Wire";
var _urlBase = "http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page=" + mediaTitle.split( ' ' ).join( '_' ) + "&callback=?";

function ajaxBoys( theURL, callback ) {
	$.ajax({
		type: "GET",
		url: theURL,
		contentType: "application/json; charset=utf-8",
		async: false,
		headers: { 'Api-User-Agent': 'Vuewiki 0.1 (github.com/tjallen/vuewiki); thomwork@gmail.com' },
		xhrFields: {
				withCredentials: true
		},
		dataType: "json",
		success: function ( data, textStatus, jqXHR ) {
			// debug info
			console.log( "Success! Looking up " + mediaTitle + "( " + _urlBase + " )" );
			// get some text
			var markup = data.parse.text["*"];
      var blurb = $( '<div></div>' ).html( markup );
			// remove links and refs
			blurb.find( 'a' ).each( function() { $( this ).replaceWith($( this ).html()); });
			blurb.find( 'sup' ).remove();
			// get the article image
			var images = blurb.find( 'img' );
			var mainImage = images[0];
			// set text and image
			$wikiImage.html( images[0] );
			$wikiText.html( $( blurb ).find( 'p' ) );
		},
		error: function( errorMessage ) {
			console.log( "error!" );
			console.log( errorMessage.statusText );
		}
	});
	if ( callback && typeof( callback ) === "function" ) {
		callback();
	}
}

$( document ).ready( function() {
	ajaxBoys( _urlBase, myCallback );
});

function myCallback() {
	console.log( "eeyyyy im a callback" );
	console.log( myData );
}
