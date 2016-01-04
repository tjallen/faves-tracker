// dev vars

// cache dom
/*var myApp = $( '#vuewiki' );
var $wikiMedia = $( '.media' );
var $wikiText = $wikiMedia.find( '.media__text' );
var $wikiImage = $wikiMedia.find( '.media__image' );
// bulding the url
var mediaTitles = [
	// 'The Wire',
	'Breaking Bad',
	// 'Deadwood',
	'The Wire'
];*/
var dataCache = {};
var _apiEndpoint = 'http://en.wikipedia.org/w/api.php';
var apiAction = '?action=query';
var apiFormat = '&format=json';
var apiProp = '&prop=categories|extracts|pageprops';
//var _urlBase = 'http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text|categories&section=0&page=';
var _urlBase = _apiEndpoint + apiAction + apiFormat + apiProp +  '&exsentences=3&exintro=&explaintext=&titles=';
var searchBase = _apiEndpoint + '?action=opensearch&format=json&limit=10&namespace=0&suggest=&search=';

/* request url for parse -> query change
/w/api.php?action=query&prop=categories|extracts|pageprops&format=json&exintro=&explaintext=&titles=The%20Wire
*/

/****************************
VUE 
****************************/

Vue.config.debug = true;

// SEARCH: extend and register global component
Vue.component('search-component', {
	template: '#search-template',
	http: {
		headers: { 'Api-User-Agent': 'Vuewiki 0.1 (github.com/tjallen/vuewiki); thomwork@gmail.com' }
	},
	data: function() {
		return {
			query: '',
			loading: false
		};
	},
	props: ['results'],
	computed: {
		resultsPresent: function() {
				return this.results.length;
		}
	},
	methods: {
		// update search results array or reset
		progress: function() {
			// temporary results array
			var resultsCache = [];
			// if empty, clear results and default
			if ( !this.query ) {
				this.clear();
				return;
			}
			// if query typed, perform GET request
			if ( this.query ) {
				this.loading = true;
				this.$http.jsonp( searchBase + this.query ).then(function( response ) {
					// for each result, push an object to results array
					for ( var i = 0; i < response.data[1].length; i++ ) {
						resultsCache.push({ 
							title: response.data[1][i], 
							blurb: response.data[2][i], 
							link: response.data[3][i],
							genre: ''
						});
					}
					this.loading = false;
					// replace results data with temp array
					this.results = resultsCache;
				});
			}
		},
		// clear search results and reset state
		clear: function() {
			this.loading = false;
			this.query = '';
			this.results = [];
		},
		// add selected result to the media array
		addMedia: function( media ) {
			this.$http.jsonp(_urlBase + media).then(function( response ) {
				VM.$data.medias.push( media );
				this.query = '';
				this.results = [];
			});
		}
	}
});

// MEDIAS: extend and register global component
Vue.component('media-component', {
	template: '#media-template',
	data: function() {
		return {
			editedMedia: null,
		};
	},
	props: ['list', 'genres'],
	computed: {
	},
	methods: {
		deleteMedia: function( media ) {
			this.list.$remove( media );
		},
		startEdit: function( media ) {
			this.originalTitle = media.title;
			this.editedMedia = media;
		},
		completeEdit: function( media ) {
			if ( !this.editedMedia ) {
				return;
			}
			this.editedMedia = '';
			media.title = media.title;
			// if text is empty, delete this media
			if ( !media.title ) {
				this.deleteMedia( media );
			}
		},
		cancelEdit: function( media ) {
			media.title = this.originalTitle;
			this.editedMedia = null;
		}
	},
	directives: {
		// only focus on input after dom has updated
		'media-focus': function( val ) {
			if ( !val ) {
				return;
			}
			var el = this.el;
			Vue.nextTick(function() {
				el.focus();
			});
		}
	}
});

var VM = new Vue({
	el: '#app',
	data: {
		medias: [
			// { title: 'Deadwood' },
			// { title: 'Breaking Bad' },
			// { title: 'The Wire' }
		],
		searchResults: [],
		genres: [
			{ title: "tv", order: 1 },
			{ title: "film", order: 2 },
			{ title: "album", order: 3 },
			{ title: "artist (music)", order: 4 },
			{ title: "artist (art)", order: 5 },
			{ title: "game", order: 6 },
			{ title: "book", order: 7 },
			{ title: "play", order: 8 }
		]
	}
/*	filters: {
		all: function( tasks ) {
			return tasks.filter( function ( task ) {
				return tasks;
			});
		},
		active: function( tasks ) {
			return tasks.filter( function ( task ) {
				return ! task.completed;
			});
		},
		completed: function( tasks ) {
			return tasks.filter( function ( task ) {
				return task.completed;
			});
		}
	}*/
});
