var PEER_API_KEY = '1qtba8tbi8gp66r';
var MESSAGE_TYPES = {
	right: 0,
	left: 1
};

var time = 0;
var currentSlide = 1;
var nbSlides;

function updateProgress() {
	$('#progress').html(currentSlide + ' / ' + nbSlides);
}

function updateNextSlide() {
	console.log($('.slides section'))
	if (currentSlide < nbSlides) {		
		$('#next').removeClass('hide');
		$('#nextSlide').html($('.slides section:nth-child(' + (currentSlide + 1) + ')').html());
	} else {
		$('#next').addClass('hide');
		$('#nextSlide').html('<h1>END</h1>');
	}
}

$(function() {

 	if (Modernizr.touch && ($(window).height() <= 480 || $(window).width() <= 480)) {// remote controller !
   	FastClick.attach(document.body);

		nbSlides = $('section').length;
		updateProgress();
		updateNextSlide();

   	$('#remote').removeClass('hide');
   	$('.reveal').addClass('hide');

   	// bind events
   	$('#startTimer').on('touchstart', function () {
   		$(this).addClass('hide');
   		$('#timer').removeClass('hide');

   		// start timer !
   		setInterval(function () {
   			time++;
   			var seconds = time % 60
   			var sTime = Math.floor(time / 60) + ':' + (seconds < 10 ? '0' : '') + seconds; 
   			$('#timer').html(sTime);
   		}, 1000);
   	});

   	// connect to presentation
   	var peer = new Peer(null, {key: PEER_API_KEY});
		var conn = peer.connect('prezz');

		conn.on('open', function () {
			console.log('Connected to presentation !');

			// bind swipe events
			$('#remote').swipe({
				swipe:function(event, direction, distance, duration, fingerCount) {
					switch (direction) {
						case 'right':
							console.log('Swipe right')
							conn.send(MESSAGE_TYPES.left);
							if (currentSlide > 1) {
								currentSlide--;
								updateProgress();
								updateNextSlide();
							}
							break;
						case 'left':
							console.log('Swipe left')
							conn.send(MESSAGE_TYPES.right);
							if (currentSlide < nbSlides) {
								currentSlide++;
								updateProgress();
								updateNextSlide();
							}
							break;
					}
				},
				threshold: 5
			});		
		});
 		
	} else {// presentation !

		// setup Reveal.js (https://github.com/hakimel/reveal.js#configuration)
		Reveal.initialize({
			history: true,		
			transition: 'default',

			dependencies: [
				{ src: 'bower_components/reveal.js/lib/js/classList.js', condition: function() { return !document.body.classList; } },
				{ src: 'bower_components/reveal.js/plugin/markdown/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
				{ src: 'bower_components/reveal.js/plugin/markdown/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
				{ src: 'bower_components/reveal.js/plugin/highlight/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
				{ src: 'bower_components/reveal.js/plugin/zoom-js/zoom.js', async: true, condition: function() { return !!document.body.classList; } },
				{ src: 'bower_components/reveal.js/plugin/notes/notes.js', async: true, condition: function() { return !!document.body.classList; } }
			]
		});

		// listen for remote controllers connections
		var peer = new Peer('prezz', { key: PEER_API_KEY });
		peer.on('connection', function (conn) {
			console.log('Remote controller is connected !');

			// register message receiver
			conn.on('data', function (data) {
				switch(data) {
					case MESSAGE_TYPES.right:
						Reveal.right();
						break;
					case MESSAGE_TYPES.left:
						Reveal.left();
						break;
				}
		  });
		});

	}

});
