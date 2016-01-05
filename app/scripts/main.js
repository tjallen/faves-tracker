// dev vars

// cache dom
/*var myApp = $( '#vuewiki' );
var $wikiMedia = $( '.media' );
var $wikiText = $wikiMedia.find( '.media__text' );
var $wikiImage = $wikiMedia.find( '.media__image' );
;*/
// bulding the url
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
	// DEV only - auto search for L U D I C R O U S  S P E E D
	created: function() {
		this.$data.query = 'The Wire';
		this.progress();
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
			this.$http.jsonp(_urlBase + media.title).then(function( response ) {
				VM.$data.medias.push( media );
				console.log(response);
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
			editedMedia: null
		};
	},
	props: ['list', 'genres'],
	computed: {
	},
	methods: {
		deleteMedia: function( media ) {
			this.list.$remove( media );
		},
		beginEdit: function( media ) {
			// cache the state of the media pre-edit
			this.origTitle = media.title;
			this.origBlurb = media.blurb;
			this.origLink = media.link;
			this.origGenre = media.genre;
			this.editedMedia = media;
		},
		completeEdit: function( media ) {
			// finish editing (keep changes)
			if ( !this.editedMedia ) {
				return;
			}
			this.editedMedia = null;
		},
		cancelEdit: function( media ) {
			this.editedMedia = null;
			// return to the pre-edit state
			media.title = this.origTitle;
			media.blurb = this.origBlurb;
			media.link = this.origLink;
			media.genre = this.origGenre;
		},
		setGenre: function( genre ) {
			this.editedMedia.genre = genre;
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
		medias: [],
		searchResults: [],
		genres: [
			{ title: "tv", order: 1 },
			{ title: "film", order: 2 },
			// { title: "album", order: 3 },
			// { title: "artist (music)", order: 4 },
			// { title: "artist (art)", order: 5 },
			// { title: "game", order: 6 },
			// { title: "book", order: 7 },
			// { title: "play", order: 8 },
			{ title: "anime", order: 9 }
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
