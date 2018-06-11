const	EventEmitter	=	require( 'events' ),
		emitter			=	new EventEmitter(),
		request			=	require( 'request' ),
		jsdom			=	require( 'jsdom' ),
		{ JSDOM }		=	jsdom

var		requestParams	=	{},
		params			=	{
								hl			: 'en',
								q			: '',
								oq			: '',
								sourceid	:	'chrome',
								ie			:	'UTF-8',
								oe			:	'UTF-8',
								start		:	0,
								num			:	10
							},
		callback		=	false

function google( keyword, cb ) {
	var query 		= []
	params.q	=	keyword
	params.oq	=	keyword
	callback	=	cb
	Object.keys( params ).forEach( param => {
		query.push( param + '=' + params[ param ] )
	} )
	var url		=	'https://google.com/search?'
	url 	+=	query.join( '&' )
	requestParams[ 'url' ] = url
	emitter.emit( 'scrap' )
}

google.requestParams = requestParams

emitter.on( 'end', results => {
	callback( results )
} )

emitter.on( 'scrap', () => {
	request( requestParams, ( error, response, body ) => {
		if ( error ) {
			console.error( error )
			return
		}
		const { document }	=	( new JSDOM( body ) ).window
		var captcha	= document.getElementById( 'recaptcha' ),
			results_list = document.querySelectorAll( 'div.g' ),
			results = []
		if ( captcha ) {
			console.error( "We've got a captcha" )
			emitter.emit( 'end', results )
			return
		}
		results_list.forEach( result => {
			var	title	=	result.querySelector( 'h3.r' ),
				url		=	result.querySelector( 'a' ),
				descr	=	result.querySelector( 'span.st' )
				f		=	result.querySelector( 'span.f' )
			if ( f ) f.remove()
			try {
				title = title.textContent
				descr = descr.textContent
				var qs = {}
				url.href.replace( /\/url\?/, '' ).split( '&' ).forEach( q => {
					q = q.split( '=' )
					qs[ q[ 0 ] ] = q[ 1 ]
				} )
				results.push( {
					title	:	title,
					url		:	qs.q,
					descr	:	descr
				} )
			} catch ( e ) {
				console.error( e )
			}
			
		} )
		emitter.emit( 'end', results )
	} )
} )

module.exports = google
