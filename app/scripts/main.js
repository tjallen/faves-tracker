var myData;
// cache dom
var myApp = $( '#vuewiki' );
var $wikiMedia = $( '.media' );
var $wikiText = $wikiMedia.find( '.media__text' );
var $wikiImage = $wikiMedia.find( '.media__image' );
// bulding the url
var mediaTitles = [
	'The Wire',
	'Breaking Bad',
	'Deadwood'
];
var mediaDatas = [];
var _apiEndpoint = 'http://en.wikipedia.org/w/api.php';
var apiAction = '?action=parse';
var apiFormat = '&format=json';
var apiProp = '&prop=text|categories';
//var _urlBase = 'http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text|categories&section=0&page=';
var _urlBase = _apiEndpoint + apiAction + apiFormat + apiProp +  '&section=0&page=';
var searchBase = _apiEndpoint + '?action=opensearch&format=json&limit=10&namespace=0&search=';



function ajaxCall( _urlBase, theTitle, callback ) {
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
			console.log(data.parse.categories);
			for ( var i = 0; i < cats.length; i++ ) {
				// check if its a disambiguation pg
				if ( cats[i]['*'] === 'Disambiguation_pages' ) {
					console.log("disambiguation page detected! " + cats[i]['*']);
					// go to the corrected page
				}
			}
			console.log( 'Success! Looking up ' + this.url );
			// get some text
			var markup = data.parse.text['*'];
      var blurb = $( '<div></div>' ).html( markup );
			// remove links and refs
			blurb.find( 'a' ).each( function() { $( this ).replaceWith($( this ).html()); });
			blurb.find( 'sup' ).remove();
			// get the article image
			var images = blurb.find( 'img' );
			var mainImage = images[0];
			// set text and image
			$wikiImage.append( images[0] );
			$wikiText.append( $( blurb ).find( 'p' ) );
		},
		error: function( errorMessage ) {
			console.log( 'error!' );
			console.log( errorMessage.statusText );
		}
	});
	if ( callback && typeof( callback ) === 'function' ) {
		callback();
	}
}

$( document ).ready( function() {
	for ( var i = 0; i < mediaTitles.length; i++ ) {
		ajaxCall( _urlBase, mediaTitles[i], myCallback );
	}
});

function myCallback() {
	console.log( 'eeyyyy im a callback' );
	console.log( myData );
}





/****************************
VUE 
****************************/

Vue.config.debug = true;

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
			var text = this.newTask.trim();
			if ( text ) {
				this.list.push({ text: text, completed: false});
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
			this.originalText = task.text;
			this.editedTask = task;
		},
		completeEdit: function( task ) {
			if ( !this.editedTask ) {
				return;
			}
			this.editedTask = '';
			task.text = task.text;
			// if text is empty, delete this task
			if ( !task.text ) {
				this.deleteTask( task );
			}
		},
		cancelEdit: function( task ) {
			task.text = this.originalText;
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
			{ text: 'A task', completed: false },
			{ text: 'A completed task', completed: true } 
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
