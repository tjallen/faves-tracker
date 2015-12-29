var myData;
// cache dom
var myApp = $( '#vuewiki' );
var $wikiMedia = $( '.media' );
var $wikiText = $wikiMedia.find( '.media__text' );
var $wikiImage = $wikiMedia.find( '.media__image' );
// bulding the url
var mediaTitles = [
	// 'The Wire',
	// 'Breaking Bad',
	// 'Deadwood',
	'The Wire'
];
var mediaDatas = [];
var _apiEndpoint = 'http://en.wikipedia.org/w/api.php';
var apiAction = '?action=parse';
var apiFormat = '&format=json';
var apiProp = '&prop=text|images|categories';
//var _urlBase = 'http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text|categories&section=0&page=';
var _urlBase = _apiEndpoint + apiAction + apiFormat + apiProp +  '&section=0&page=';
var searchBase = _apiEndpoint + '?action=opensearch&format=json&limit=10&namespace=0&search=';

/* request url for parse -> query change
/w/api.php?action=query&prop=categories|extracts|pageprops&format=json&exintro=&explaintext=&titles=The%20Wire
*/



function ajaxCall( theTitle, callback ) {
	$.ajax({
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
			var cats = data.parse.categories;
			// debug info
			mediaDatas.push( data );
			for ( var i = 0; i < cats.length; i++ ) {
				// check if its a disambiguation pg
				if ( cats[i]['*'] === 'Disambiguation_pages' ) {
					console.log("disambiguation page detected! " + cats[i]['*']);
					// go to the corrected page
				}
			}
			console.log( 'Success! Looking up ' + this.url );
			console.log(data.parse);
			// get some text
			var markup = data.parse.text['*'];
      var blurb = $( '<div></div>' ).html( markup );
			// remove links and refs
			blurb.find( 'a' ).each( function() { $( this ).replaceWith($( this ).html()); });
			blurb.find( 'sup' ).remove();
			// get the article image
			var title = data.parse.title;
			var images = blurb.find( 'img' );
			var mainImage = images[0];
			// set text and image
			vm.$data.tasks.push({ title: title, text: blurb[0], image: data.parse.images[0] });
			//$wikiImage.append( images[0] );
			//$wikiText.append( $( blurb ).find( 'p' ).first() );
		},
		error: function( errorMessage ) {
			console.log( 'error!' );
			console.log( errorMessage.statusText );
		}
	});
}

$( document ).ready( function() {
	for ( var i = 0; i < mediaTitles.length; i++ ) {
		ajaxCall( mediaTitles[i] );
	}
});




/****************************
VUE 
****************************/

Vue.config.debug = true;


/*Vue.component('typeahead', {
	//template: VueTypeaheadTemplate, // optional if u inline
	mixins: [VueTypeaheadMixin],
	data: function () {
		return {
			src: '...', // required
			data: {}, // opt
			limit: 5, // opt
			onHit: function( item ) { // required
				// ...
			},
			prepareResponseData: function( data ) { // optional
				// data = ...
				return data;
			}
		};
	}
});*/

// extend and register a global component in 1 step
var VC = Vue.component('tasks-component', {
	template: '#tasks-template',
	data: function() {
		return {
			newTask: '',
			editedTask: null,
		};
	},
	props: ['list'],
	computed: {
		// compute remaining active tasks
		remaining: function() {
			return this.list.filter( this.isActive ).length;
		},
		// compute completed tasks on list
		completed: function() {
			return this.list.filter( this.isComplete ).length;
		}
	},
	methods: {
		addTask: function() {
			var title = this.newTask.trim();
			if ( title ) {
				ajaxCall( title );
				//this.list.push({ title: title });
				this.newTask = '';
			}
		},
		deleteTask: function( task ) {
			this.list.$remove( task );
		},
		isComplete: function( task ) {
			return task.completed;
		},
		isActive: function ( task ) {
			return ! this.isComplete( task );
		},
		toggleCompleted: function ( task ) {
			task.completed = ! task.completed;
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
		},
		clearCompleted: function() {
			this.list = this.list.filter( this.isActive );
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
			{ title: 'Deadwood' },
			{ title: 'Breaking Bad' },
			{ title: 'The Wire' }
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
