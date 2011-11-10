/********************************************************************************************
* Author: Sebastian Porto
* Nov 2011
* v.0.6.5
* https://github.com/sporto/js_image_carousel
* ******************************************************************************************/

var Carousel = function(element, args){
	var _this = {};
	var _$element = element;
	//var _$figures;
	// var _element = element.get();//store the DOM element
	var _$viewport;
	var _$movable;
	var _viewportWidth = 0; //the width of the viewport
	var _viewportHeight = 0;	
	var _showMultiple = (typeof(args.showMultiple)==='undefined') ? true : args.showMultiple; //show multiple images in the viewport
	var _centered = (typeof(args.centered)==='undefined') ? true : args.centered;//only relevant if _showMultiple is false		
	var _imagesLoaded = 0;
	var _originalItems = [];//references to the original figures, no clones here
	var _originalItemsCount = 0;
	var _originalItemsTotalWidth = 0; //original width of all the figures, no clones counted
	var _originalItemsWidthsArray = [];	
	var _allItemsTotalWidth = 0;
	var _allItemsWithArray = [];
	var _currentIndex = 0;
	var _$arrowPrevious;
	var _$arrowNext;
	var _$counterElement;
	var _clickEnable=true;
	var _speed = 1000;
	var _auto=false;
	var _autoSpeed = 5000;
	var _autoTimer;
	var _debug = false;
	var _captions = [];
	var _$captionElement;
	var _preItemsOffset = 0 ; //difference between the first item and the original first item
	var _callbacks = {};
	var _logger ={
		debug:function(msg){
			if(console.log) console.log(msg);
		}
	};

	if(args.speed) _speed = args.speed;
	if(args.auto) _auto = args.auto;
	if(args.autoSpeed) _autoSpeed = args.autoSpeed;
	if(args.debug) _debug = args.debug;
	if(args.btnPrevious) _$arrowPrevious = args.btnPrevious;
	if(args.btnNext) _$arrowNext = args.btnNext;
	if(args.captionElement) _$captionElement = args.captionElement;
	if(args.counterElement) _$counterElement = args.counterElement;
	if(args.onChange) _callbacks.onChange = args.onChange;
	if(args.logger) _logger = args.logger;

	init(0);
	
	function init(n){
		log("init", n);

		modifyStructure();
		
		$(".figure", _$element).hide();

		//check for all the images to load
		waitForImages(0);
	}

	function modifyStructure(n){
		log("@modifyStructure", n);
		//get all the figures and wrap them in a container
		$(".figure",_$element).wrapAll("<div class='viewport'><div class='movable'></div></div>");
	}

	function getImageWidth($image){
		var width=0;
		width = parseInt($image.attr("width")); //try the image attribute first
		if(width>0) return width;
		width = parseInt($image[0].width);//try the width property
		return width;
	}

	function waitForImages(n){
		log("@waitForImages", n);
		var image, 
			$image,
			width;

		var $images = $(".figure img", _$element);
		_originalItemsCount = $images.length;

		for(var ix=0; ix<_originalItemsCount; ix++){
			//image = $images[ix];
			$images.eq(ix).data("index",ix);//store the index
			checkImageLoaded($images[ix]);
		}
	}

	function checkImageLoaded(image,n){
		log("@checkImageLoaded");
		var $image = $(image);
		var width	= getImageWidth($image);

		log("src " + $image.attr("src") );
		log("image.complete " + image.complete);
		log("width " + width);

		if(width!==0){
			log1("Image complete", n);
			onImageLoaded(image,n+1);
		}else{
			reloadImage(image,n+1);
		}
	}

	function reloadImage(image,n){
		log("@reloadImage",n)
		//var src = $(image).attr("src");
		var src = image.src;
		log1("src = " + src,n);
		// log1("Image complete " + image.complete);
		image.onload=function(event){
			onImageLoaded(image,n+1);
		};
		image.src = "";//trigger a reload
		setTimeout(
			function(){
				log("Reloading image " + src);
				image.src = src
			},
			500);
	}

	function onImageLoaded(image,n){
		log("@onImageLoaded", n);
		var $image = $(image);

		var ix = $image.data("index");
		log1( "index " + ix, n);

			//var w = image.width;
		log1("image width " + getImageWidth($(image)), n);
		log1("src = " + image.src);

		//_originalItemsWidthsArray[ix] = w;
		_imagesLoaded++;
		log1("_imagesLoaded " + _imagesLoaded, n);
		if(_originalItemsCount===_imagesLoaded) initWithImages(n+1);
	}

	function initWithImages(n){
		log("@initWithImages", n);

		//remove all unnecessary/conflicting styles
		removeCurrentStyles(n+1);
		
		//store the width of the container
		_viewportWidth = _$element.width();
		_viewportHeight = _$element.height();
		log1("_viewportWidth "+ _viewportWidth, n);
		log1("_viewportHeight "+ _viewportHeight, n);
	
		_$movable = $(".movable",_$element);
		_$viewport = $(".viewport",_$element);

		processOriginalItems(n+1);

		//set up the styles of the elements
		_$element.css("position","relative");
		_$viewport.css("position","relative").css("overflow","hidden").css("width",_viewportWidth+"px").css("height",_viewportHeight+"px" );
		_$movable.css("position","absolute").css('top','0px').css("height", _viewportHeight+"px" );
	
		//clone elements on the right
		makePostItems(n+1);

		//clone one item on the left
		makePreItems(n+1);

		//add click listener to elements
		$(".figure",_$element).click(
			function(event){
				onItemClick(event,0);
			});
	
		setupCaption(n+1);
		setupArrows(n+1);//put arrows on top of caption

		addCurrentHighlight(n+1);
		showCurrentCaption(n+1);
		showCurrentCounter(n+1);
		startAuto();

	}//init

	function startAuto(n){
		log("@startAuto", n);
		log1("_auto = " + _auto,n);
		if (!_auto) return;

		if(_autoSpeed>0){
			_autoTimer = window.setInterval(
				function(){
					moveNext(n+1);
				},
				_autoSpeed
			);
		}
	}

	function publicStartAuto(){
		log("@publicStartAuto");
		_auto = true;
		startAuto(0);
	}

	function stopAuto(n){
		log("@stopAuto", n);
		window.clearInterval(_autoTimer);
	}

	function publicStopAuto(){
		stopAuto(0);
	}

	function removeCurrentStyles(n){
		$(".figure",_$element).css("margin","0px").css("padding","0px");
		$(".figure img",_$element).css("margin","0px").css("padding","0px");
	}

	function processOriginalItems(n){
		log("@processOriginalItems", n);

		//store references to the original elements
			_originalItems = $(".figure",_$element);

		//in order to get the width on an image in IE the container must be visible
		$(".figure", _$element).show();
			
		for(var i=0, len = _originalItems.length; i<len; i++){
			processOriginalItem(i,n+1);
		}

		log1("_originalItemsTotalWidth " + _originalItemsTotalWidth, n);
		log1("_originalItemsCount " + _originalItemsCount, n);

		//change the opacity of each image
		//and prepare the styles
			_originalItems.fadeTo(0,0.5);
			_originalItems.css("float","left");

			_allItemsTotalWidth = _originalItemsTotalWidth;
	}
	
	function processOriginalItem(ix,n){
		log("@processOriginalItem", n);
		var $item = _originalItems.eq(ix);
		log1( "$item " + $item, n);
		
		//store and hide the captions
		var $caption = $(".figcaption", $item);
		_captions[ix] =  $caption ;
		$caption.hide();

		var $image = $("img",$item);
		//var image = $image.get(0);

		var itemWidth = getImageWidth($image);
		log1( "itemWidth " +itemWidth, n);


		if(itemWidth===0 || itemWidth===undefined){
			log1("ERROR Could not get the width of image", n);
			//provide a fallback here, this doesn't behave if the images have different widths
			itemWidth = _$element.width();
		}
		log1("itemWidth = " + itemWidth, n);
		
		//if not multiple images then change the width of each figure to take all the viewport width
			if(!_showMultiple){
				$item.width(_viewportWidth);
				if(_centered){
					$item.css("text-align","center");
				}
				itemWidth = _viewportWidth;
			}
			
		//make an array with the size of each image
		//and store the total width of the images
		
		_originalItemsWidthsArray.push(itemWidth);
		_allItemsWithArray.push(itemWidth);
		_originalItemsTotalWidth += itemWidth;
	}
	
	function makePreItems(n){
		log("@makePreItems", n);
		//only one pre clone is made
		var clonedIndex = _originalItemsCount-1;
		log1("clonedIndex " + clonedIndex, n);
		var clonedWidth = _originalItemsWidthsArray[clonedIndex];
		log1("clonedWidth " + clonedWidth, n);
		var clone = $(_originalItems[clonedIndex]).clone();
		
		_allItemsWithArray.unshift(clonedWidth);
		_allItemsTotalWidth += clonedWidth;

		_$movable.prepend( clone );
		moveMovable(-clonedWidth,n+1);
		resetMovableWidth(n+1);

		_currentIndex++;
		_preItemsOffset++;

		log1( "_allItemsTotalWidth " + _allItemsTotalWidth, n);
		log1( "_currentIndex " + _currentIndex, n);
		log1( "_preItemsOffset " + _preItemsOffset, n);
	}

	function makePostItems(n){
		log("@makePostItems", n);
		var tooMany = 0;
		var nextIndex = 0;
		//at least one post item

		do{
			tooMany++;
			if(tooMany> 25 ) {
				log1("Too many post items!!!", n);
				break;
			}
			if(nextIndex >= _originalItemsCount) nextIndex = 0;
			clonePostItem(nextIndex,n+1);
			nextIndex++;
		}while( (_allItemsTotalWidth < _viewportWidth*2.5) || (_allItemsTotalWidth < _originalItemsTotalWidth*3) );

		log1("_allItemsTotalWidth " + _allItemsTotalWidth, n);
	}

	function clonePostItem(clonedIndex,n){
		log("@clonePostItem", n);
		log1("clonedIndex "+ clonedIndex, n);
		var clonedWidth = _originalItemsWidthsArray[clonedIndex];
		log1("clonedWidth " + clonedWidth, n);
		var clone = $(_originalItems[clonedIndex]).clone();

		_allItemsWithArray.push(clonedWidth);
		_allItemsTotalWidth += clonedWidth;

		_$movable.append(clone);
		resetMovableWidth(n+1);
	}

	function rebuildWidths(n){
		//_allItemsTotalWidth
		//_allItemsWithArray
	}

	function resetMovableWidth(n){
		log("resetMovableWidth", n);
		_$movable.width(_allItemsTotalWidth);
	}

	function setupArrows(n){
		if(_originalItemsCount > 1){
			if(!_$arrowPrevious){
				_$arrowPrevious = $("<div class='arrow previous' />");
				_$arrowPrevious.appendTo(_$element);
			}
			if(!_$arrowNext){
				_$arrowNext = $("<div class='arrow next' />");
				_$arrowNext.appendTo(_$element);
			}
			_$arrowPrevious.click(function(event){
				onArrowPrevious(event,0);
				return false;
			});
			_$arrowNext.click(function(event){
				onArrowNext(event,0);
				return false;
			});
		}
	}

	function setupCaption(n){
		if(!_$captionElement){
			_$captionElement = $("<div class='caption' />");
			_$captionElement.appendTo(_$element);
		}
	}

	function onArrowPrevious(event,n){
		stopAuto();
		if(_clickEnable) movePrevious(n+1);
		return false;
	}

	function onArrowNext(event,n){
		stopAuto();
		if(_clickEnable) moveNext(n+1);
		return false;
	}

	function onItemClick(event,n){
		log("@onItemClick", n);
		stopAuto();
		var ix = $(event.currentTarget).index();
		moveTo(ix,n+1);
	}

	function movePrevious(n){
		move(-1,n+1);
	}

	function moveNext(n){
		move(1,n+1);
	}

	function move(dir,n){
		moveTo(_currentIndex + dir, n+1);
	}

	function moveTo(toIndex,n){
		log( "@moveTo " + toIndex, n);
		log1("_currentIndex " + _currentIndex, n);
		log1("_allItemsTotalWidth = " + _allItemsTotalWidth, n);
		if(_allItemsTotalWidth===0){
			rebuildWidths(n+1);
		}

		if(toIndex===_currentIndex) return;

		_clickEnable = false;
		removeHighlight(_currentIndex,n+1);
		hideCaption(n+1);
		
		if(toIndex===_currentIndex) return;

		var indexDif = toIndex - _currentIndex;
		log1("indexDif " + indexDif, n);

		var shifted = 0;

		if(toIndex<_currentIndex){
			shifted = shiftMovableAllLeft(n+1);
			log1("shifted " + shifted, n);
			toIndex += (shifted*_originalItemsCount);
		}

		if(toIndex>_currentIndex){
			shifted = shiftMovableAllRight(n+1);
			log1("shifted " + shifted, n);
			toIndex -= (shifted*_originalItemsCount);
		}

		log1("new toIndex " + toIndex, n);
		
		animate(_currentIndex,toIndex,n+1);

		_currentIndex = toIndex;
		addCurrentHighlight(n+1);

		//callback
		if(_callbacks.onChange) _callbacks.onChange();
	}

	function publicMoveTo(toIndex){
		log("@publicMoveTo");
		//log(toIndex);
		var ccix = getCompressedCurrentIndex();
		var dif = _currentIndex - ccix;
		moveTo(toIndex+dif);
	}

	function getDifference(fromIndex,toIndex,n){
		log("@getDifference", n);

		if(fromIndex<0) throw("fromIndex invalid " + fromIndex);
		if(toIndex<0) throw("toIndex invalid " + toIndex);

		log1("getDifference", n);
		log1("fromIndex " + fromIndex, n);
		log1("toIndex " + toIndex, n);

		if(fromIndex===toIndex) return 0;

		var dif = 0;

		if(fromIndex>toIndex){
			log1("Backwards", n);
			for(var ix = toIndex; ix<fromIndex; ix++){
				dif += _allItemsWithArray[ix];
			}
			return dif;
		}

		if(fromIndex<toIndex){
			log1("Forward", n);
			for(var ix = fromIndex; ix<toIndex; ix++){
				dif += _allItemsWithArray[ix];
			}
			return -dif;
		}
	}

	function animate(fromIndex, toIndex,n){
		log("@animate", n);
		log1("fromIndex " + fromIndex, n);
		log1("toIndex " + toIndex, n);

		var dif = getDifference(fromIndex, toIndex,n+1);
		log1("dif " + dif, n);

		var newLeft = getMovableLeft(n+1) + dif;

		log1("newLeft " + newLeft, n);

		_$movable.animate({
			left:newLeft
		},_speed,function(){animateDone(n)});

	}

	function animateDone(n){
		log("animateDone", n);
		_clickEnable = true;
		//show the text
		//showItemCaption();
		showCurrentCaption(n+1);
		showCurrentCounter(n+1);
		resetMovablePosition(n+1);
	}
	
	function getMovableLeft(n){
		return _$movable.position().left;
	}

	function getMovableRight(n){
		return getMovableLeft() + getMovableTotalWidth();
	}

	function setMovableLeft(n,left){
		_$movable.css("left",left);
	}

	function getMovableTotalWidth(n){
		return _allItemsTotalWidth;
	}

	function moveMovable(dist,n){
		log("@moveMovable " + dist, n);
		setMovableLeft(n+1,getMovableLeft(n+1) + dist);
	}

	function resetMovablePosition(n){
		//make sure that the movable is where it needs to be
		log("@resetMovablePosition", n);
		log1("_currentIndex " + _currentIndex, n);
		var le = 0;
		for(var i=0; i<_currentIndex; i++){
			le += _allItemsWithArray[i];
		}
		log1(-le, n);
		setMovableLeft(n+1,-le);
	}

	function shiftMovableAllLeft(n){
		var shifted = 0;

		while( shiftMovableOneLeft(n+1) ){
			shifted ++;
		}
		return shifted;
	}

	function shiftMovableOneLeft(n){
		log("@shiftMovableOneLeft", n);

		var newCurrentIndex =_currentIndex + _originalItems.length;

		log1("_currentIndex "+ _currentIndex, n);
		log1("newCurrentIndex "+ newCurrentIndex, n);

		var movableRight =  getMovableRight(n+1);
		var newMovableRight = movableRight - _originalItemsTotalWidth;
		log1( "movableRight " + movableRight, n);
		log1( "newMovableRight " + newMovableRight, n);
		log1( "_originalItemsTotalWidth " + _originalItemsTotalWidth, n);
		log1( "_viewportWidth " + _viewportWidth, n);

		var check1 = newMovableRight >= _viewportWidth;
		var check2 = newCurrentIndex < _allItemsWithArray.length;

		log1("check1 "+check1, n);
		log1("check2 "+check2, n);

		if(check1 && check2){
			moveMovable(- _originalItemsTotalWidth,n+1);
			_currentIndex = newCurrentIndex;
			log1("new currentIndex " + _currentIndex, n);
			return true;
		}else{
			log1("Cannot more the movable left any further", n);
			return false;
		}
	}

	function shiftMovableAllRight(n){
		//move the movable all the way to the extreme right
		var shifted = 0 ;

		while( shiftMovableOneRight(n+1) ){
			shifted++;
		}

		return shifted;
	}

	function shiftMovableOneRight(n){
		log("@shiftMovableOneRight", n);

		var newCurrentIndex =_currentIndex - _originalItems.length;
		log1("newCurrentIndex " + newCurrentIndex, n);

		// var check1 = getMovableLeft()<0;//there are no items on the left
		var check2 = newCurrentIndex>=0;

		log1("check " + check2, n);

		if( check2 ){
			moveMovable(_originalItemsTotalWidth,n+1);
			_currentIndex = newCurrentIndex;
			log1("new currentIndex " + _currentIndex, n);
			return true;
		}else{
			log1("Cannot move movable right any further", n);
			return false;
		}

	}

	function addCurrentHighlight(n){
		log("@addCurrentHighlight " + _currentIndex, n);
		addHighlight(_currentIndex,n+1);
	}

	function addHighlight(index,n){
		log("@addHighlight " + index, n);
		$(".figure",_$element).eq(index).fadeTo(0,1);
	}

	function removeHighlight(index,n){
		$(".figure",_$element).eq(index).fadeTo(0,.5);
		//hide caption
		$(".figcaption",_$element).eq(index).hide();
	}

	function showCurrentCaption(n){
		log("showCurrentCaption " + _currentIndex, n);
		showCaption(_currentIndex,n+1);
	}

	function showCaption(index,n){
		log("@showCaption " + index, n);
		index = getCompressedIndex(index,n+1);
		log( "index " + index, n);
		var cap = _captions[index];
		cap.show();
		_$captionElement.html( cap );
		_$captionElement.find(".figcaption").css("display","block");
		_$captionElement.fadeIn(500);
	}	

	function showCurrentCounter(n){
		log("@showCurrentCounter", n);
		if(_$counterElement){
			var ix = getCompressedCurrentIndex(n+1);
			log1("ix " + ix, n);
			_$counterElement.html("Showing image " + (getCompressedCurrentIndex(n+1)+1) + " of " + _originalItemsCount);
		}
	}

	function hideCaption(n){
		_$captionElement.hide();
	}

	function getCompressedCurrentIndex(n){
		//return the index that corresponds to the current image in the array of original items
		return getCompressedIndex(_currentIndex,n+1);
	}

	function getCompressedIndex(index,n){
		//given any image index
		
		//return the index that corresponds to this image in the array of original items
		var ix = index%_originalItems.length - _preItemsOffset;

		if(ix<0) return _originalItems.length-1;

		return ix;
	}

	function log(msg,nesting){
		if(!_debug) return;
		var output = "";
		for(var a=0; a<nesting; a++){
			output += " - ";
		}
		output += msg;

		_logger.debug(output);
	}

	function log1(msg,nesting){
		log(msg,nesting+1);
	}

	//public functions
	_this.getCurrentIndex = getCompressedCurrentIndex;
	_this.moveTo = publicMoveTo;
	_this.startAuto = publicStartAuto;
	_this.stopAuto = publicStopAuto;

	return _this;

};