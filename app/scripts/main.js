// dev vars

// cache dom
/*var myApp = $( '#vuewiki' );
var $wikiMedia = $( '.media' );
var $wikiText = $wikiMedia.find( '.media__text' );
var $wikiImage = $wikiMedia.find( '.media__image' );
;*/

/****************************
VUE 
****************************/

Vue.config.debug = true;

// SEARCH: extend and register global component
Vue.component('search-component', {
	template: '#search-template',
	http: {
		headers: {
			 'Api-User-Agent': 'Faves tracker 0.1 (github.com/tjallen/faves-tracker); thomwork@gmail.com'
		 }
	},
	data: function() {
		return {
			query: '',
			loading: false
		};
	},
	props: ['results', 'searchcall'],
	computed: {
		resultsPresent: function() {
				return this.results.length;
		}
	},
	// DEV only - auto search for L U D I C R O U S  S P E E D
	created: function() {
		// this.$data.query = 'The Wire';
		// this.progress();
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
				this.$http.jsonp( VM.$data.dbSearch + this.query ).then(function( response ) {
					// for each result, push an object to results cache
					for ( var i = 0; i < response.data.results.length; i++ ) {
						// tv data uses "name" property whereas movie uses "title" so we standardise the objects here
						var mediaTitle;
						if ( response.data.results[i].media_type === 'tv' ) {
							mediaTitle = response.data.results[i].name;
						}
						if ( response.data.results[i].media_type === 'movie' ) {
							mediaTitle = response.data.results[i].title;
						}
						resultsCache.push({ 
							type: response.data.results[i].media_type,
							title: mediaTitle, 
							blurb: response.data.results[i].overview, 
							imagePath: response.data.results[i].poster_path,
							imagePathAbsolute: 'https://image.tmdb.org/t/p/w396/' + response.data.results[i].poster_path,
							id: response.data.results[i].id,
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
			this.$http.jsonp( 'https://api.themoviedb.org/3/' + media.type + '/' + media.id + '?api_key=' + VM.$data.keys.moviesdb ).then(function( response ) {
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
			editedMedia: null
		};
	},
	props: ['list', 'types'],
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
			this.origType = media.type;
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
			media.type = this.origType;
		},
		setType: function( type ) {
			this.editedMedia.type = type;
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
		keys: {},
		dbSearch: null,
		medias: [],
		searchResults: [],
		types: [
			{ title: "tv", order: 1 },
			{ title: "film", order: 2 },
			// { title: "album", order: 3 },
			// { title: "artist (music)", order: 4 },
			// { title: "artist (art)", order: 5 },
			// { title: "game", order: 6 },
			// { title: "book", order: 7 },
			// { title: "play", order: 8 },
			// example to use for add custom type feature: { title: "anime", order: 9 }
		]
	},
	ready: function() {
		// get and store api keys from key storage when VM is ready
		this.$http.get('../keys.json').then(function ( response ) {
			this.$set( 'keys', response.data.keys );
			// build search api request and set
			// move to search component later prob
			this.$set( 'dbSearch', 'https://api.themoviedb.org/3/search/multi?api_key=' + this.keys.moviesdb + '&query=');
		});
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
