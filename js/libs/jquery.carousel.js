/********************************************************************************************
* Author: Sebastian Porto
* August 2011
* v.0.5.2
* Source code is in https://github.com/sporto/js_image_carousel
* ******************************************************************************************/

var Carousel = function(element, args){
	var _that = this;
	var _$element = element;
	var _$figures;
	// var _element = element.get();//store the DOM element
	var _$viewport;
	var _$movable;
	var _viewportWidth = 0; //the width of the viewport
	
	var _showMultiple = (typeof(args.showMultiple)==='undefined') ? true : args.showMultiple; //show multiple images in the viewport
	var _centered = (typeof(args.centered)==='undefined') ? true : args.centered;//only relevant if _showMultiple is false
		
	var _originalItems = [];//references to the original figures, no clones here
	var _originalItemsCount = 0;
	var _originalItemsTotalWidth = 0; //original width of all the figures, no clones counted
	var _originalItemsWidthsArray = [];
	
	var _allItemsTotalWidth = 0;
	var _allItemsWithArray = [];

	var _currentIndex = 0;
	var _$arrowPrevious;
	var _$arrowNext;
	var _clickEnable=true;
	var _speed = 1000;
	var _debug = false;
	
	var _captions = [];
	var _$captionElement;
	var _captionOffset = 0 ; //difference between the current index and the corresponding caption

	if(args.speed) _speed = args.speed;
	if(args.debug) _debug = args.debug;

	init();
	
	function init(){
		log("init");
		//cache images array
		_$figures = $("figure", _$element);
		//all image must be loaded
		_$figures.hide();
		//check for all the images to load
		waitForImages();
		//wait for all the images to load
		// $(window).load(
		// 	function(){
		// 		initWithImages();
		// });
	}

	function waitForImages(){
		log("waitForImages");

		 $(window).load(
			function(){
				initWithImages();
		});

		/*
		var $images = $("img", _$element);
		var len = $images.length;
		var loaded = 0;
		for(var a=0; a<len; a++){
			//var image = new Image;
			var image = $images[a];
			//log(image);
			var src = $(image).attr("src");
			log(src);
			image.onload=function(){
				log(this.complete);
				log($(this).width() );
				loaded++;
				//if(loaded===len) initWithImages();
			}
			image.src = src;
		}
		*/
	}

	function initWithImages(){
		log("initWithImages");
		
	//store the width of the container
		_viewportWidth = _$element.width();
	
	//get all the figures and wrap them in a container
		$("figure",_$element).wrapAll("<div class='movable' />");
		_$movable = $(".movable",_$element);
		_$movable.wrap("<div class='viewport' />");
		_$viewport = $(".viewport",_$element);


	processOriginalItems();

	//set up the styles of the elements
		_$element.css("position","relative");
		_$viewport.css("position","relative").css("overflow-x","hidden").css("width",_$element.width()).css("height",_$element.height() );
		_$movable.css("position","absolute");
	
	//clone elements on the right
		makePostItems();

	//clone one item on the left
		makePreItems();

	//add click listener to elements
		$("figure",_$element).click(onItemClick);
	
		setupCaption();
		setupArrows();//put arrows on top of caption		

		addCurrentHighlight();
		showCurrentCaption();

	}//init


	function processOriginalItems(){
		log("processOriginalItems");

		//store references to the original elements
			_originalItems = $("figure",_$element);
			
		for(var i=0, len = _originalItems.length; i<len; i++){
			processOriginalItem(i);
		}

		//change the opacity of each image
		//and prepare the styles
			_originalItems.fadeTo(0,0.5);
			_originalItems.css("float","left");

			_allItemsTotalWidth = _originalItemsTotalWidth;
	}
	
	function processOriginalItem(ix){
		log("processOriginalItem");
		var $item = _$figures.eq(ix);
		//log($item);
		var $image = $("img",$item);
		//log($image);
		//log($image.get(0));
		//var itemWidth = $image.outerWidth();
		//var itemWidth = $image.get(0).clientWidth;

		//log("$item.width() " + $item.width());
		//log("$image.outerWidth() " + $image.outerWidth());
		//log("$image.get(0).clientWidth " + $image.get(0).clientWidth );
		//log("$image.get(0).offsetWidth " + $image.get(0).offsetWidth );
		
		//store and hide the captions
		var $caption = $("figcaption", $item);
		_captions[ix] =  $caption ;
		$caption.hide();

		var itemWidth = $item.width();

		if(itemWidth===0){
			log("ERROR Could not get the width of image");
			//provide a fallback here
			itemWidth = _$element.width();
		}
		log("itemWidth = " + itemWidth);
		
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
		_originalItemsCount++;
	}
	
	function makePreItems(){
		log("makePreItems");
		// var nextToClone = _originalItems - _pre
		var clonedIndex = _originalItemsCount-1;
		log("clonedIndex " + clonedIndex);
		var clonedWidth = _originalItemsWidthsArray[clonedIndex];
		log("clonedWidth " + clonedWidth);
		var clone = $(_originalItems[clonedIndex]).clone();
		
		_allItemsWithArray.unshift(clonedWidth);
		_allItemsTotalWidth += clonedWidth;

		_$movable.prepend( clone );
		moveMovable(-clonedWidth);
		//log(getMovableLeft());
		resetMovableWidth();

		_currentIndex++;
		_captionOffset++;
	}

	function makePostItems(){
		log("makePostItems");
		var tooMany = 0;
		var nextIndex = 0;
		while( (_allItemsTotalWidth) < (_viewportWidth*2.5) ){
			tooMany++;
			if(tooMany> 15 ) {
				log("Too many!!!");
				break;
			}
			if(nextIndex >= _originalItemsCount) nextIndex = 0;
			clonePostItem(nextIndex);
			nextIndex++;
		}
	}

	function clonePostItem(clonedIndex){
		log("clonePostItem " + clonedIndex);
		var clonedWidth = _originalItemsWidthsArray[clonedIndex];
		log("clonedWidth " + clonedWidth);
		var clone = $(_originalItems[clonedIndex]).clone();

		_allItemsWithArray.push(clonedWidth);
		_allItemsTotalWidth += clonedWidth;

		_$movable.append(clone);
		resetMovableWidth();
	}

	function rebuildWidths(){
		//_allItemsTotalWidth
		//_allItemsWithArray
	}

	function resetMovableWidth(){
		log("resetMovableWidth");
		_$movable.width(_allItemsTotalWidth);
	}

	function setupArrows(){
		if(_originalItemsCount > 1){
			_$arrowPrevious = $("<div class='arrow previous' />");
			_$arrowNext = $("<div class='arrow next' />");
			_$arrowPrevious.appendTo(_$element);
			_$arrowNext.appendTo(_$element);

			_$arrowPrevious.click(onArrowPrevious);
			_$arrowNext.click(onArrowNext);
		}
	}

	function setupCaption(){
		_$captionElement = $("<div class='caption' />");
		_$captionElement.appendTo(_$element);
	}

	function onArrowPrevious(event){
		if(_clickEnable) movePrevious();
	}

	function onArrowNext(event){
		if(_clickEnable) moveNext();
	}

	function onItemClick(event){
		//scope on this function is the clicked element
		var ix = $(this).index();
		moveTo( ix );
	}

	function movePrevious(){
		move(-1);
	}

	function moveNext(){
		move(1);
	}

	function move(dir){
		moveTo( _currentIndex + dir);
	}

	function moveTo(toIndex){
		log( "-------moveTo " + toIndex );
		log("_currentIndex " + _currentIndex);
		log("_allItemsTotalWidth = " + _allItemsTotalWidth);
		if(_allItemsTotalWidth===0){
			rebuildWidths();
		}

		if(toIndex===_currentIndex) return;

		_clickEnable = false;
		removeHighlight(_currentIndex);
		hideCaption();
		
		if(toIndex===_currentIndex) return;

		var indexDif = toIndex - _currentIndex;
		log("indexDif " + indexDif);

		var shifted = 0;

		if(toIndex<_currentIndex){
			shifted = shiftMovableAllLeft();
			log("shifted " + shifted);
			toIndex += (shifted*_originalItemsCount);
		}

		if(toIndex>_currentIndex){
			shifted = shiftMovableAllRight();
			log("shifted " + shifted);
			toIndex -= (shifted*_originalItemsCount);
		}

		log("new toIndex " + toIndex);
		
		animate(_currentIndex,toIndex);

		_currentIndex = toIndex;
		addCurrentHighlight();
	}

	function getDifference(fromIndex,toIndex){

		if(fromIndex<0) throw("fromIndex invalid " + fromIndex);
		if(toIndex<0) throw("toIndex invalid " + toIndex);

		log("getDifference");
		log("fromIndex " + fromIndex);
		log("toIndex " + toIndex);

		if(fromIndex===toIndex) return 0;

		var dif = 0;

		if(fromIndex>toIndex){
			log("Backwards");
			for(var ix = toIndex; ix<fromIndex; ix++){
				dif += _allItemsWithArray[ix];
			}
			return dif;
		}

		if(fromIndex<toIndex){
			log("Forward");
			for(var ix = fromIndex; ix<toIndex; ix++){
				dif += _allItemsWithArray[ix];
			}
			return -dif;
		}
	}

	function animate(fromIndex,toIndex){
		log("animate");
		log("fromIndex " + fromIndex);
		log("toIndex" + toIndex);

		var dif = getDifference(fromIndex, toIndex);
		log("dif " + dif);

		var newLeft = getMovableLeft() + dif;

		log("newLeft " + newLeft);

		_$movable.animate({
			left:newLeft
		},_speed,animateDone);

	}

	function animateDone(){
		log("animateDone");
		_clickEnable = true;
		//show the text
		//showItemCaption();
		showCurrentCaption();
		resetMovablePosition();
	}
	
	function getMovableLeft(){
		return _$movable.position().left;
	}

	function getMovableRight(){
		return getMovableLeft() + getMovableTotalWidth();
	}

	function setMovableLeft(left){
		_$movable.css("left",left);
	}

	function getMovableTotalWidth(){
		return _allItemsTotalWidth;
	}

	function moveMovable(dist){
		log("moveMovable " + dist);
		setMovableLeft(getMovableLeft() + dist);
	}

	function resetMovablePosition(){
		//make sure that the movable is where it needs to be
		log("resetMovablePosition");
		log(_currentIndex);
		var le = 0;
		for(var i=0; i<_currentIndex; i++){
			le += _allItemsWithArray[i];
		}
		log(-le);
		setMovableLeft(-le);
	}

	function shiftMovableAllLeft(){
		var shifted = 0;

		while( shiftMovableOneLeft() ){
			shifted ++;
		}
		return shifted;
	}

	function shiftMovableOneLeft(){
		log("shiftMovableOneLeft");

		var newCurrentIndex =_currentIndex + _originalItems.length;

		var check1 = (getMovableRight()-_originalItemsTotalWidth) >= _viewportWidth;
		var check2 = newCurrentIndex < _allItemsWithArray.length;

		if(check1 && check2){
			moveMovable( - _originalItemsTotalWidth);
			_currentIndex = newCurrentIndex;
			log("new currentIndex " + _currentIndex);
			return true;
		}else{
			log("Cannot more the movable left any further");
			return false;
		}
	}

	function shiftMovableAllRight(){
		//move the movable all the way to the extreme right
		var shifted = 0 ;

		while( shiftMovableOneRight() ){
			shifted++;
		}

		return shifted;
	}

	function shiftMovableOneRight(){
		log("shiftMovableOneRight");

		var newCurrentIndex =_currentIndex - _originalItems.length;
		log("newCurrentIndex " + newCurrentIndex);

		// var check1 = getMovableLeft()<0;//there are no items on the left
		var check2 = newCurrentIndex>=0;

		log("check " + check2);

		if( check2 ){
			moveMovable(_originalItemsTotalWidth);
			_currentIndex = newCurrentIndex;
			log("new currentIndex " + _currentIndex);
			return true;
		}else{
			log("Cannot move movable right any further");
			return false;
		}

	}

	function addCurrentHighlight(){
		log("addCurrentHighlight " + _currentIndex);
		addHighlight(_currentIndex);
	}

	function addHighlight(index){
		log("addHighlight " + index);
		$("figure",_$element).eq(index).fadeTo(0,1);
	}

	function removeHighlight(index){
		$("figure",_$element).eq(index).fadeTo(0,.5);
		//hide caption
		$("figcaption",_$element).eq(index).hide();
	}

	function showCurrentCaption(){
		log("showCurrentCaption " + _currentIndex);
		showCaption(_currentIndex-_captionOffset);
	}

	function showCaption(index){
		log("showCaption " + index);
		index = getCompressedIndex(index);
		var cap = _captions[index];
		cap.show();
		_$captionElement.html( cap );
		_$captionElement.find("figcaption").css("display","block");
		_$captionElement.fadeIn(500);
	}	

	function hideCaption(){
		_$captionElement.hide();
	}

	function getCompressedIndex(index){
		//given any image index
		if(index<0) return _originalItems.length-1;
		//return the index that corresponds to this image in the array of original items
		return index%_originalItems.length;
	}

	function log(msg){
		if(!_debug) return;
		if(window.log) window.log(msg);
	}

};