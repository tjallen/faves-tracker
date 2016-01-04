var myData;
// cache dom
var myApp = $( '#vuewiki' );
var $wikiMedia = $( '.media' );
var $wikiText = $wikiMedia.find( '.media__text' );
var $wikiImage = $wikiMedia.find( '.media__image' );
// bulding the url
var mediaTitles = [
	// 'The Wire',
	'Breaking Bad',
	// 'Deadwood',
	'The Wire'
];
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

/*function ajaxSearch( theTitle ) {
	return $.ajax({
		type: 'GET',
		url: searchBase + theTitle.split( ' ' ).join( '_' ),
		contentType: 'application/json; charset=utf-8',
		async: false,
		headers: { 'Api-User-Agent': 'Vuewiki 0.1 (github.com/tjallen/vuewiki); thomwork@gmail.com' },
		dataType: 'jsonp',
		success: function ( data, textStatus, jqXHR ) {
			console.log(data[1]); // page titles
			console.log(data[2]); // descriptions
			console.log(data[3]); // urls
		},
		error: function( errorMessage ) {
			alert( 'error!' );
			console.log( errorMessage.statusText );
		}
	});
}*/

/*function ajaxCall( theTitle, callback ) {
	return $.ajax({
		type: 'GET',
		url: _urlBase + theTitle.split( ' ' ).join( '_' ) + '&callback=?',
		contentType: 'application/json; charset=utf-8',
		async: false,
		headers: { 'Api-User-Agent': 'Vuewiki 0.1 (github.com/tjallen/vuewiki); thomwork@gmail.com' },
		xhrFields: {
				withCredentials: true
		},
		dataType: 'json',
		success: function ( data, textStatus, jqXHR ) {
			var dataID = Object.getOwnPropertyNames(data.query.pages);
			var dataEntry = data.query.pages[dataID];
			var dataCats = dataEntry.categories;
			// check if disambiguation page
			if ( dataEntry.pageprops.hasOwnProperty('disambiguation') ) {
				console.log('DISAMBIG');
			} else {
				
			}
			var wikiTitle = dataEntry.title;
			var wikiImage = dataEntry.pageprops.page_image;
			var wikiExtract = dataEntry.extract;
			// console.log(dataEntry);
			vm.$data.tasks.push( { title: wikiTitle, text: wikiExtract, image: wikiImage } );
			//var dataTitle = data.
			//dataCache[dataID] = data;
		},
		error: function( errorMessage ) {
			alert( 'error!' );
			console.log( errorMessage.statusText );
		}
	});
}*/

/*$( document ).ready( function() {
	for ( var i = 0; i < mediaTitles.length; i++ ) {
		ajaxCall( mediaTitles[i] );
	}
});*/


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
			searchQuery: ''
		};
	},
	props: ['results'],
	methods: {
		performSearch: function() {
			// if text present when submitted, perform GET request
			var title = this.searchQuery.trim();
			if ( title ) {
				this.$http.jsonp(searchBase + title).then(function( response ) {
					// for each result, push an object to results array
					for ( var i = 0; i < response.data[1].length; i++ ) {
						this.results.push({ 
							title: response.data[1][i], 
							blurb: response.data[2][i], 
							link: response.data[3][i] 
						});
					}
				});
				// clear results if field is empty
			} else {
				this.results = '';
			}
		}
	}
});

// TASKS: extend and register global component
Vue.component('tasks-component', {
	template: '#tasks-template',
	data: function() {
		return {
			newTask: '',
			editedTask: null,
		};
	},
	props: ['list'],
	computed: {
	},
	methods: {
		addTask: function() {
			var title = this.newTask.trim();
			if ( title ) {
				ajaxCall( title );
				this.newTask = '';
			}
		},
		deleteTask: function( task ) {
			this.list.$remove( task );
		},
		startEdit: function( task ) {
			this.originalTitle = task.title;
			this.editedTask = task;
		},
		completeEdit: function( task ) {
			if ( !this.editedTask ) {
				return;
			}
			this.editedTask = '';
			task.title = task.title;
			// if text is empty, delete this task
			if ( !task.title ) {
				this.deleteTask( task );
			}
		},
		cancelEdit: function( task ) {
			task.title = this.originalTitle;
			this.editedTask = null;
		}
	},
	directives: {
		// only focus on input after dom has updated
		'task-focus': function( val ) {
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

var vm = new Vue({
	el: '#app',
	data: {
		tasks: [
			// { title: 'Deadwood' },
			// { title: 'Breaking Bad' },
			// { title: 'The Wire' }
		],
		searchResults: []
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
