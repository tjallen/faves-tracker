(function( exports ) {
	'use strict';
	
	var _storage_key = 'vue-medias';
	
	exports.mediaStore = {
		retrieve: function() {
			console.log( 'got from localStorage' );
			return JSON.parse( localStorage.getItem( _storage_key ) || '[]');
		},
		save: function( medias ) {
			console.log( 'saved to localStorage' );
			return localStorage.setItem( _storage_key, JSON.stringify( medias ) );
		},
		clear: function() {
			console.log( 'clearing medias from localStorage' );
			return localStorage.clear( _storage_key );
		}
	};
	
})( window );
