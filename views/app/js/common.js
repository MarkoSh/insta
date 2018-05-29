( function() {

	new WOW().init()

	var tags_place = document.getElementById( 'tags_place' )

	var table = new Vue( {
		el	: '#content',
		data: {
			tags : []
		},
		methods: {
			sort_by: function ( e ) {
				if ( e ) {
					var sort = e.target.dataset.sort
					var tags = table.tags.slice()
					tags.sort( function ( a, b ) {
						return  b[ sort ] - a[ sort ]
					} )
					// tags.forEach( function ( tag ) {
					// 	console.log( tag[ sort ] )
					// } )
					table.tags = tags
				}
			},
			collect: function ( e ) {
				if ( e ) {
					e.preventDefault()
					var a = e.target
					var collected_tags = tags_place.value.split( ' ' )
					collected_tags.push( a.dataset.tag )
					collected_tags = collected_tags.filter( function ( value, index, self ) {
						return self.indexOf( value ) === index;
					} )
					tags_place.value = collected_tags.join( ' ' )
				}
			}
		}
	} )

	axios.get( '/tags' ).then( function ( response ) {
		table.tags = response.data
	} )

	var progressBar = document.querySelector( '.progress-bar' )

	var getStatus = function () {
		axios.get( '/status' ).then( function ( response ) {
			if ( 'collecting' === response.data.status ) {
				progressBar.style.width = response.data.perc + '%'
				setTimeout( function () {
					getStatus()
				}, 3000 )
			} else {
				progressBar.style.width = 0
			}
		} )
		axios.get( '/tags' ).then( function ( response ) {
			table.tags = response.data
		} )
	}
	getStatus()

} )()
