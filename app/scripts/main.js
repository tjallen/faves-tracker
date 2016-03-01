
(function ( exports ) {
  'use strict';

  Vue.config.debug = true;

  // SEARCH: extend and register global component
  Vue.component('search-component', {
    template: '#search-template',
    http: {
      headers: {
         'Api-User-Agent': 'Faves tracker 0.6 (github.com/tjallen/faves-tracker); thomwork@gmail.com'
       }
    },
    data: function() {
      return {
        query: '',
        loading: false
      };
    },
    props: [ 'results', 'searchcall' ],
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
          this.$http.jsonp( exports.app.$data.dbSearch + this.query ).then(function( response ) {
            var mediaTitle, // -> media.title
                mediaDate, // -> media.date
                mediaLanguage, // -> media.language
                mediaImage, // -> media.image
                displayTitle = false, // def
                displayPoster = true, // def (tbc)
                i,
                length = response.data.results.length;
            // iterate through results
            for ( i = 0; i < length; i++ ) {
              // exclude persons from the results
              if ( response.data.results[ i ].media_type === 'person' ) {
                break;
              }
              /* tv data uses "name" & "first_air_date" properties whereas movie uses "title" & "release_date" so we standardise the mediaTitle & mediaDate vars here */
              switch ( response.data.results[ i ].media_type ) {
                case 'tv':
                  mediaTitle = response.data.results[ i ].name;
                  // check first_air_date is truthy so we don't get a typeError if it's null
                  if ( response.data.results[ i ].first_air_date ) {
                    mediaDate = response.data.results[ i ].first_air_date.substring( 0,4 );
                  }
                  break;
                case 'movie':
                  mediaTitle = response.data.results[ i ].title;
                  // check release_date is truthy so we don't get a typeError if it's null
                  if ( response.data.results[ i ].release_date ) {
                  mediaDate = response.data.results[ i ].release_date.substring( 0,4 );  
                  }
                  break;
              }
              // set up a language property if there is one, otherwise null
              if ( response.data.results[ i ].original_language ) {
                mediaLanguage = response.data.results[ i ].original_language;
              } else {
                mediaLanguage = null;
              }
              // set up poster options
              if ( response.data.results[ i ].poster_path !== null ) {
                mediaImage = 'https://image.tmdb.org/t/p/w396/' + response.data.results[ i ].poster_path;
              // if there's no poster available, use pholder
              } else if ( response.data.results[ i ].poster_path === null ) {
                displayTitle = true;
                mediaImage = '/images/media-placeholder.jpg';
              }
              // push an object to results cache
              resultsCache.push({ 
                type: response.data.results[ i ].media_type,
                title: mediaTitle, 
                blurb: response.data.results[ i ].overview, 
                date: mediaDate,
                language: mediaLanguage,
                imagePath: response.data.results[ i ].poster_path,
                imagePathAbsolute: mediaImage,
                dragging: false, // (tbc)
                displayTitle: displayTitle,
                displayPoster: displayPoster,
                id: response.data.results[ i ].id,
              });
            }
            this.loading = false;
            // replace results data with the results cache
            this.results = resultsCache;
          });
        }
      },
      // clear search results, query; reset state
      clear: function() {
        this.loading = false;
        this.query = '';
        this.results = [];
      },
      // add selected result to the media array
      addMedia: function( media ) {
        var idToCheck,
            lodashFindMedia;
        // check if media's already been added
        idToCheck = media.id;
        lodashFindMedia = _.find(exports.app.$data.medias, { 'id': idToCheck });
        if ( lodashFindMedia !== undefined ) {
          // send to message component later
          alert('Media already added');
          return;
        }
        this.$http.jsonp( 'https://api.themoviedb.org/3/' + media.type + '/' + media.id + '?api_key=' + exports.app.$data.keys.moviesdb ).then(function( response ) {
          exports.app.$data.medias.push( media );
          this.clear();
        });
      }
    }
  });
  
  // MESSAGES: extend & register component
  Vue.component('message-component', {
    template: '#message-template',
    data: function() {
      // bind display of this element to the property so we can toggle
      return {
        show: false
      };
    },
    props: {
      type: {
        type: String
      },
      dismissable: {
        type: Boolean,
        default: false,
      },
      duration: {
        type: Number,
        default: 0
      },
    },
    computed: {
      // computed types of messages
      messageTypes: function() {
        return {
          'message': true,
          'message--success': this.type == 'success',
          'message--warning': this.type == 'warning'
        };
      }
    },
    events: {
      'event--delete' : function(msg) {
        console.log('broadcast recieved by message component' + this._uid + 'the msg was: ' + msg );
        this.show = true;
      }
    },
    watch: {
      show: function( value ) {
        // clearTimeout if it already exists
        if ( this._timeout ) clearTimeout( this._timeout );
        // set a timeout to toggle show after
        if ( value && Boolean( this.duration ) ) {
          this._timeout = setTimeout( this.toggleShow, this.duration );
        }
      }
    },
    methods: {
      toggleShow: function() {
        this.show = !this.show;
      }
    }
  });

  // MEDIAS: extend and register global component
  Vue.component('media-component', {
    template: '#media-template',
    data: function() {
      return {
        editedMedia: null,
        deleteCache: null,
        msg: ''
      };
    },
    props: [ 'list', 'types' ],
    computed: {
    },
    methods: {
      deleteMedia: function( media ) {
        this.deleteCache = media;
        this.msg = media.title;
        console.log(media.title);
        // remove from medias list
        exports.app.$data.medias.$remove( media );
        // broadcast to children
        this.$broadcast( 'event--delete', this.msg );
      },
      undoDelete: function() {
        exports.app.$data.medias.push( this.deleteCache );
      },
      resetMessage: function() {
        this.msg = '';
      },
      beginEdit: function( media ) {
        // cache the state of the media pre-edit
        this.origTitle = media.title;
        this.origBlurb = media.blurb;
        this.origType = media.type;
        this.editedMedia = media;
      },
      completeEdit: function( media ) {
        // finish editing (keep changes)
        console.log("completeEdit");
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
        media.type = this.origType;
      },
      setType: function( type ) {
        this.editedMedia.type = type;
      },
      changeOrder: function ( media, source, destination ) {
        var swapCache;
        // check the media isn't at the start || end of list
        // (buttons should only v-show when useable now tho)
        if ( exports.app.$data.medias[destination] === undefined ) {
          return;
        }
        // swap the source and destination medias
        swapCache = exports.app.$data.medias[destination];
        exports.app.$data.medias.$set(destination, exports.app.$data.medias[source]);
        exports.app.$data.medias.$set(source, swapCache);
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

  exports.app = new Vue({
    el: '#app',
    data: {
      keys: {},
      dbSearch: null,
      medias: mediaStore.retrieve(),
      searchResults: [],
      types: [
        { title: "tv", order: 1 },
        { title: "film", order: 2 }
      ]
    },
    watch: {
      medias: {
        handler: function ( medias ) {
          mediaStore.save( medias );
        },
        deep: true
      }
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
  });

})( window );
