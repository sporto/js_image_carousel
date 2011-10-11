An image carousel using jQuery

##Usage

###Include jQuery and carousel on your page

	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.js"></script>
	<script src='js/libs/jquery.carousel.js'></script>

###Prepare HTML
	
	<div id="carousel1" class="carousel">
		<div class="figure">
			<img src="images/450x100a.gif" />
			<div class="figcaption">
				Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
			</div>
		</div>
		<div class="figure">
			<img src="images/450x100b.gif" />
			<div class="figcaption">
				Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
			</div>
		</div>
		...
	</div>  
	
###Initialise the carousel when the DOM is ready

	<script type="text/javascript">
		$(function(){
	  	var carousel1 = Carousel($("#carousel1"),{speed:100, debug:false});
		});
	</script>

###Added elements
The script will wrap the <figures> around two divs:

	<div id="carousel1" class="carousel">
		<div class="viewport">
			<div class="movable">
				<div class="figure" ...>
			</div>
		</div>
	</div>
	
###CSS
At least the following CSS is needed

	#carousel1{
		overflow:hidden;
		width:XXpx;
		height:XXpx;
	}

###Arrow elements
The script will create a couple of arrow elements for you. i.e. <div class="arrow next"></div>. You will need to style this element in CSS. For example:

	.carousel .arrow{
		width:30px;
		height:30px;		
		position:absolute;
		top: 40px;
	}
	
	.carousel .previous{
		background-image:url('path/to/image.png');
		left:0;
	}
	
	.carousel .next{
		background-image:url('path/to/image.png');
		right:0;
	}
	
###Caption
The script will also create a caption element <div class="caption">...</div>. You can also style this element using CSS. For example:

	.carousel .caption{
		background-color: black;	
		position: absolute;
		top:  80px;
		left: 0px;
		color: white;
	}

##Options

The following options are available:

**speed** (1000)
Speed of transition in milliseconds

**showMultiple** (true)
Show multiple images at the same time in the viewport (Only relevant if images are smaller than the viewport)

**centered** (true)
Center the image in the viewport (Only relevant if showMultiple is false)

**debug** (false)
Debug mode, show log messages

**btnPrevious** (null)
Optional reference to a jquery element to be used as previous button

**btnNext** (null)
Optional reference to a jquery element to be used as next button

**captionElement** (null)
Optional reference to a jquery element to be used as container for the captions

**counterElement** (null)
Optional reference to a jquery element to be used as container for counter

##Changelog

v.0.6
Figure tags removed, div added instead. This is to deal with weird behaviour in IE when using figure.

v.0.5.3
Extra arguments added: btnPrevious and btnNext

v.0.5
Added a 'viewport' element around 'movable'

##Acknowledgements

Thanks to [SCT](http://www.sct.com.au/) for the original idea and the time for improvements and bug fixing.