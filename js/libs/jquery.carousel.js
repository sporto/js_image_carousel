/********************************************************************************************
* Author: Sebastian Porto
* Nov 2011
* v.0.6.2
* https://github.com/sporto/js_image_carousel
* ******************************************************************************************/

var Carousel = function(element, args){
	var _that = this;
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
	var _autoSpeed = 0;
	var _autoTimer;
	var _debug = false;
	
	var _captions = [];
	var _$captionElement;
	var _preItemsOffset = 0 ; //difference between the first item and the original first item

	if(args.speed) _speed = args.speed;
	if(args.autoSpeed) _autoSpeed = args.autoSpeed;
	if(args.debug) _debug = args.debug;
	if(args.btnPrevious) _$arrowPrevious = args.btnPrevious;
	if(args.btnNext) _$arrowNext = args.btnNext;
	if(args.captionElement) _$captionElement = args.captionElement;
	if(args.counterElement) _$counterElement = args.counterElement;

	init(0);
	
	function init(n){
		log(n,"init");

		modifyStructure();
		
		$(".figure", _$element).hide();

		//check for all the images to load
		waitForImages(0);
	}

	function modifyStructure(n){
		log(n,"@modifyStructure");
		//get all the figures and wrap them in a container
		$(".figure",_$element).wrapAll("<div class='viewport'><div class='movable'></div></div>");
	}

	function waitForImages(n){
		log(n,"@waitForImages");

		var $images = $("img", _$element);
		_originalItemsCount = $images.length;

		for(var ix=0; ix<_originalItemsCount; ix++){
			var image = $images[ix];
			$(image).data("index",ix);//store the index

			if(image.complete && image.width!==0){
				log1(n, "Image complete " + ix);
				onImageLoaded(n+1,image);
			}else{
				reloadImage(n+1,image);
			}
			
		}
	}

	function reloadImage(n,image){
		log(n,"@reloadImage")
		//var src = $(image).attr("src");
		var src = image.src;
		// log1(n,"Image complete " + image.complete);
		image.onload=function(event){
			onImageLoaded(n+1,image);
		};
		image.src = "";//trigger a reload
		image.src = src;
	}

	function onImageLoaded(n,image){
		log(n,"@onImageLoaded");
		var ix = $(image).data("index");
		log1(n, "index " + ix);

		//var w = image.width;
		log1(n, "image.width " + image.width);

		//_originalItemsWidthsArray[ix] = w;
		_imagesLoaded++;
		if(_originalItemsCount===_imagesLoaded) initWithImages(n+1);
	}

	function initWithImages(n){
		log(n,"@initWithImages");

		//remove all unnecessary/conflicting styles
		removeCurrentStyles(n+1);
		
		//store the width of the container
		_viewportWidth = _$element.width();
		_viewportHeight = _$element.height();
		log1(n,"_viewportWidth "+ _viewportWidth);
		log1(n,"_viewportHeight "+ _viewportHeight);
	
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
				onItemClick(0,event);
			});
	
		setupCaption(n+1);
		setupArrows(n+1);//put arrows on top of caption

		addCurrentHighlight(n+1);
		showCurrentCaption(n+1);
		showCurrentCounter(n+1);
		startAuto();

	}//init

	function startAuto(n){
		log(n,"@startAuto");
		if(_autoSpeed>0){
			_autoTimer = setInterval(
				function(){
					moveNext(n+1);
				},
				_autoSpeed
			);
		}
	}

	function stopAuto(){
		clearInterval(_autoTimer);
	}

	function removeCurrentStyles(n){
		$(".figure",_$element).css("margin","0px").css("padding","0px");
		$("img",_$element).css("margin","0px").css("padding","0px");
	}

	function processOriginalItems(n){
		log(n,"@processOriginalItems");

		//store references to the original elements
			_originalItems = $(".figure",_$element);

		//in order to get the width on an image in IE the container must be visible
		$(".figure", _$element).show();
			
		for(var i=0, len = _originalItems.length; i<len; i++){
			processOriginalItem(n+1,i);
		}

		log1(n,"_originalItemsTotalWidth " + _originalItemsTotalWidth);
		log1(n,"_originalItemsCount " + _originalItemsCount);

		//change the opacity of each image
		//and prepare the styles
			_originalItems.fadeTo(0,0.5);
			_originalItems.css("float","left");

			_allItemsTotalWidth = _originalItemsTotalWidth;
	}
	
	function processOriginalItem(n,ix){
		log(n,"@processOriginalItem");
		var $item = _originalItems.eq(ix);
		log1(n, "$item " + $item);
		
		//store and hide the captions
		var $caption = $(".figcaption", $item);
		_captions[ix] =  $caption ;
		$caption.hide();

		var $image = $("img",$item);
		var image = $image.get(0);

		var itemWidth = image.width;
		log1(n, "itemWidth " +itemWidth);


		if(itemWidth===0 || itemWidth===undefined){
			log1(n,"ERROR Could not get the width of image");
			//provide a fallback here, this doesn't behave if the images have different widths
			itemWidth = _$element.width();
		}
		log1(n,"itemWidth = " + itemWidth);
		
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
		log(n,"@makePreItems");
		//only one pre clone is made
		var clonedIndex = _originalItemsCount-1;
		log1(n,"clonedIndex " + clonedIndex);
		var clonedWidth = _originalItemsWidthsArray[clonedIndex];
		log1(n,"clonedWidth " + clonedWidth);
		var clone = $(_originalItems[clonedIndex]).clone();
		
		_allItemsWithArray.unshift(clonedWidth);
		_allItemsTotalWidth += clonedWidth;

		_$movable.prepend( clone );
		moveMovable(n+1,-clonedWidth);
		resetMovableWidth(n+1);

		_currentIndex++;
		_preItemsOffset++;

		log1(n, "_allItemsTotalWidth " + _allItemsTotalWidth);
		log1(n, "_currentIndex " + _currentIndex);
		log1(n, "_preItemsOffset " + _preItemsOffset);
	}

	function makePostItems(n){
		log(n,"@makePostItems");
		var tooMany = 0;
		var nextIndex = 0;
		//at least one post item

		do{
			tooMany++;
			if(tooMany> 25 ) {
				log1(n,"Too many post items!!!");
				break;
			}
			if(nextIndex >= _originalItemsCount) nextIndex = 0;
			clonePostItem(n+1,nextIndex);
			nextIndex++;
		}while( (_allItemsTotalWidth < _viewportWidth*2.5) || (_allItemsTotalWidth < _originalItemsTotalWidth*3) );

		log1(n,"_allItemsTotalWidth " + _allItemsTotalWidth);
	}

	function clonePostItem(n,clonedIndex){
		log(n,"@clonePostItem");
		log1(n,"clonedIndex "+ clonedIndex);
		var clonedWidth = _originalItemsWidthsArray[clonedIndex];
		log1(n,"clonedWidth " + clonedWidth);
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
		log(n,"resetMovableWidth");
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
				onArrowPrevious(0,event);
			});
			_$arrowNext.click(function(event){
				onArrowNext(0,event);
			});
		}
	}

	function setupCaption(n){
		if(!_$captionElement){
			_$captionElement = $("<div class='caption' />");
			_$captionElement.appendTo(_$element);
		}
	}

	function onArrowPrevious(n,event){
		stopAuto();
		if(_clickEnable) movePrevious(n+1);
		return false;
	}

	function onArrowNext(n,event){
		stopAuto();
		if(_clickEnable) moveNext(n+1);
		return false;
	}

	function onItemClick(n,event){
		log(n,"@onItemClick");
		stopAuto();
		var ix = $(event.currentTarget).index();
		moveTo(n+1, ix );
	}

	function movePrevious(n){
		move(n+1,-1);
	}

	function moveNext(n){
		move(n+1,1);
	}

	function move(n,dir){
		moveTo(n+1, _currentIndex + dir);
	}

	function moveTo(n,toIndex){
		log(n, "@moveTo " + toIndex );
		log1(n,"_currentIndex " + _currentIndex);
		log1(n,"_allItemsTotalWidth = " + _allItemsTotalWidth);
		if(_allItemsTotalWidth===0){
			rebuildWidths(n+1);
		}

		if(toIndex===_currentIndex) return;

		_clickEnable = false;
		removeHighlight(n+1,_currentIndex);
		hideCaption(n+1);
		
		if(toIndex===_currentIndex) return;

		var indexDif = toIndex - _currentIndex;
		log1(n,"indexDif " + indexDif);

		var shifted = 0;

		if(toIndex<_currentIndex){
			shifted = shiftMovableAllLeft(n+1);
			log1(n,"shifted " + shifted);
			toIndex += (shifted*_originalItemsCount);
		}

		if(toIndex>_currentIndex){
			shifted = shiftMovableAllRight(n+1);
			log1(n,"shifted " + shifted);
			toIndex -= (shifted*_originalItemsCount);
		}

		log1(n,"new toIndex " + toIndex);
		
		animate(n+1,_currentIndex,toIndex);

		_currentIndex = toIndex;
		addCurrentHighlight(n+1);
	}

	function getDifference(n,fromIndex,toIndex){
		log(n,"@getDifference");

		if(fromIndex<0) throw("fromIndex invalid " + fromIndex);
		if(toIndex<0) throw("toIndex invalid " + toIndex);

		log1(n,"getDifference");
		log1(n,"fromIndex " + fromIndex);
		log1(n,"toIndex " + toIndex);

		if(fromIndex===toIndex) return 0;

		var dif = 0;

		if(fromIndex>toIndex){
			log1(n,"Backwards");
			for(var ix = toIndex; ix<fromIndex; ix++){
				dif += _allItemsWithArray[ix];
			}
			return dif;
		}

		if(fromIndex<toIndex){
			log1(n,"Forward");
			for(var ix = fromIndex; ix<toIndex; ix++){
				dif += _allItemsWithArray[ix];
			}
			return -dif;
		}
	}

	function animate(n,fromIndex, toIndex){
		log(n,"@animate");
		log1(n,"fromIndex " + fromIndex);
		log1(n,"toIndex " + toIndex);

		var dif = getDifference(n+1,fromIndex, toIndex);
		log1(n,"dif " + dif);

		var newLeft = getMovableLeft(n+1) + dif;

		log1(n,"newLeft " + newLeft);

		_$movable.animate({
			left:newLeft
		},_speed,function(){animateDone(n)});

	}

	function animateDone(n){
		log(n,"animateDone");
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

	function moveMovable(n,dist){
		log(n,"@moveMovable " + dist);
		setMovableLeft(n+1,getMovableLeft(n+1) + dist);
	}

	function resetMovablePosition(n){
		//make sure that the movable is where it needs to be
		log(n,"@resetMovablePosition");
		log1(n,"_currentIndex " + _currentIndex);
		var le = 0;
		for(var i=0; i<_currentIndex; i++){
			le += _allItemsWithArray[i];
		}
		log1(n,-le);
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
		log(n,"@shiftMovableOneLeft");

		var newCurrentIndex =_currentIndex + _originalItems.length;

		log1(n,"_currentIndex "+ _currentIndex);
		log1(n,"newCurrentIndex "+ newCurrentIndex);

		var movableRight =  getMovableRight(n+1);
		var newMovableRight = movableRight - _originalItemsTotalWidth;
		log1(n, "movableRight " + movableRight );
		log1(n, "newMovableRight " + newMovableRight );
		log1(n, "_originalItemsTotalWidth " + _originalItemsTotalWidth);
		log1(n, "_viewportWidth " + _viewportWidth);

		var check1 = newMovableRight >= _viewportWidth;
		var check2 = newCurrentIndex < _allItemsWithArray.length;

		log1(n,"check1 "+check1);
		log1(n,"check2 "+check2);

		if(check1 && check2){
			moveMovable(n+1, - _originalItemsTotalWidth);
			_currentIndex = newCurrentIndex;
			log1(n,"new currentIndex " + _currentIndex);
			return true;
		}else{
			log1(n,"Cannot more the movable left any further");
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
		log(n,"@shiftMovableOneRight");

		var newCurrentIndex =_currentIndex - _originalItems.length;
		log1(n,"newCurrentIndex " + newCurrentIndex);

		// var check1 = getMovableLeft()<0;//there are no items on the left
		var check2 = newCurrentIndex>=0;

		log1(n,"check " + check2);

		if( check2 ){
			moveMovable(n+1,_originalItemsTotalWidth);
			_currentIndex = newCurrentIndex;
			log1(n,"new currentIndex " + _currentIndex);
			return true;
		}else{
			log1(n,"Cannot move movable right any further");
			return false;
		}

	}

	function addCurrentHighlight(n){
		log(n,"@addCurrentHighlight " + _currentIndex);
		addHighlight(n+1,_currentIndex);
	}

	function addHighlight(n,index){
		log(n,"@addHighlight " + index);
		$(".figure",_$element).eq(index).fadeTo(0,1);
	}

	function removeHighlight(n,index){
		$(".figure",_$element).eq(index).fadeTo(0,.5);
		//hide caption
		$(".figcaption",_$element).eq(index).hide();
	}

	function showCurrentCaption(n){
		log(n,"showCurrentCaption " + _currentIndex);
		showCaption(n+1,_currentIndex);
	}

	function showCaption(n,index){
		log(n,"@showCaption " + index);
		index = getCompressedIndex(n+1,index);
		log(n, "index " + index);
		var cap = _captions[index];
		cap.show();
		_$captionElement.html( cap );
		_$captionElement.find(".figcaption").css("display","block");
		_$captionElement.fadeIn(500);
	}	

	function showCurrentCounter(n){
		log(n,"@showCurrentCounter");
		if(_$counterElement){
			var ix = getCompressedCurrentIndex(n+1);
			log1(n,"ix " + ix);
			_$counterElement.html("Showing image " + (getCompressedCurrentIndex(n+1)+1) + " of " + _originalItemsCount);
		}
	}

	function hideCaption(n){
		_$captionElement.hide();
	}

	function getCompressedCurrentIndex(n){
		//return the index that corresponds to the current image in the array of original items
		return getCompressedIndex(n+1,_currentIndex);
	}

	function getCompressedIndex(n,index){
		//given any image index
		
		//return the index that corresponds to this image in the array of original items
		var ix = index%_originalItems.length - _preItemsOffset;

		if(ix<0) return _originalItems.length-1;

		return ix;
	}

	function log(nesting,msg){
		if(!_debug) return;
		var output = "";
		for(var a=0; a<nesting; a++){
			output += " - ";
		}
		output += msg;
		if(console.log) console.log(output);
	}

	function log1(nesting,msg){
		log(nesting+1,msg);
	}

};