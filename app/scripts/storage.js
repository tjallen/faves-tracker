(function( exports ) {
	'use strict';
	
	var storage_key = 'vue-medias';
	
	exports.mediaStore = {
		retrieve: function() {
			console.log("retrieving state of medias from localStorage");
			return JSON.parse( localStorage.getItem( storage_key ) || '[]');
		},
		save: function( medias ) {
			console.log("saving state of medias to localStorage");
			return localStorage.setItem( storage_key, JSON.stringify( medias ) );
		}
	};
	
})( window );
