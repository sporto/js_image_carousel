/********************************************************************************************
* Author: Sebastian Porto
* August 2011
* ******************************************************************************************/

var Carousel = function(element, args){
	var _that = this;
	var _$element = element;
	// var _element = element.get();//store the DOM element
	var _$movable;
	var _viewportWidth = 0; //the width of the viewport
	
	var _originalItems = [];//references to the original figures, no clones here
	var _originalItemsCount = 0;
	var _originalItemsTotalWidth = 0; //original width of all the figures, no clones counted
	var _originalItemsWidthsArray = [];
	
	// var _preItems = [];
	// var _preItemsCount = 0;
	// var _preItemsTotalWidth = 0;
	// var _preItemsWidthsArray = [];
	
	// var _postItems = [];
	// var _postItemsCount = 0;
	// var _postItemsTotalWidth = 0;
	// var _postItemsWidthsArray = [];

	// var _allItems = [];
	// var _allItemsCount = 0;
	var _allItemsTotalWidth = 0;
	var _allItemsWithArray = [];

	// var _clonedItemsTotalWidth = 0 ; //total width of the movable area
	// var _clonedItemsWidthsArray = [];
	var _currentIndex = 0;
	var _$arrowPrevious;
	var _$arrowNext;
	var _clickEnable=true;
	var _speed = 1000;
	var _debug = false;

	if(args.speed) _speed = args.speed;
	if(args.debug) _debug = args.debug;

	init();

	function init(){
	//store the width of the container
		_viewportWidth = _$element.width();
	
	//get all the figures and wrap them in a container
		$("figure",_$element).wrapAll("<div class='movable' />");
		_$movable = $(".movable",_$element);

	processOriginalItems();

	//set up the styles of the elements
		_$element.css("position","relative");
		// _$element.css("overflow-x","hidden");
		_$movable.css("position","absolute");

	//store the starting width of the movable
		// _clonedItemsTotalWidth = _originalItemsTotalWidth;

	//clone one item on the left
		makePreItems();

	//clone elements on the right
		makePostItems();

	//add click listener to elements
		$("figure",_$element).click(onItemClick);
	
	//resize the container
		// _$movable.width(_clonedItemsTotalWidth);

		setupArrows();

		addHighlight(_currentIndex);

	}//init

	function processOriginalItems(){
		//store references to the original elements
			_originalItems = $("figure",_$element);
			// _allItems = $("figure",_$element);

		//hide the captions
			$("figure figcaption",_$element).hide();

		//change the opacity of each image
		//and prepare the styels
			_originalItems.fadeTo(0,0.5);
			_originalItems.css("float","left");

		//make an array with the size of each image
		//and store the total width of the images
			$("figure img",_$element).each(function(){
				var w = $(this).width()
				_originalItemsWidthsArray.push(w);
				_allItemsWithArray.push(w);
				// _allItems.push(w);
				// _clonedItemsWidthsArray.push(w);
				_originalItemsTotalWidth += w;
				// _allItemsTotalWidth += w;
				_originalItemsCount++;
				// _allItemsCount++;
			});

			_allItemsTotalWidth = _originalItemsTotalWidth;

	}

	function makePreItems(){
		log("makePreItems");
		// var nextToClone = _originalItems - _pre
		var clonedIndex = _originalItemsCount-1;
		log("clonedIndex " + clonedIndex);
		var clonedWidth = _originalItemsWidthsArray[clonedIndex];
		log("clonedWidth " + clonedWidth);
		var clone = $(_originalItems[clonedIndex]).clone();
		
		// _preItems.push(clone);
		// _preItemsWidthsArray.push(clonedWidth);
		// _preItemsTotalWidth += clonedWidth;

		// Array(_allItems).unshift(clone);
		_allItemsWithArray.unshift(clonedWidth);
		_allItemsTotalWidth += clonedWidth;
		// _allItemsCount ++;

		_$movable.prepend( clone );
		moveMovable(-clonedWidth);
		resetMovableWidth();

		_currentIndex++;
	}

	function makePostItems(){
		log("makePostItems");
		var tooMany = 0;
		var nextIndex = 0;
		while( (_allItemsTotalWidth) < (_viewportWidth*2) ){
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
		var clone = $(_originalItems[clonedIndex]).clone();

		// log("_allItems")
		// log(_allItems);

		// _allItems.push(clone);
		_allItemsWithArray.push(clonedWidth);
		_allItemsTotalWidth += clonedWidth;
		// _allItemsCount ++;

		// _postItems.push(clone);
		// _postItemsWidthsArray.push(clonedWidth);
		// _postItemsTotalWidth += clonedWidth;

		_$movable.append(clone);
		resetMovableWidth();
	}

	function resetMovableWidth(){
		// _$movable.width(_preItemsTotalWidth+_originalItemsTotalWidth+_postItemsTotalWidth);
		_$movable.width(_allItemsTotalWidth);
	}

	// function addSetOnRigth(){
	// 	_originalItems.each(function(ix, ele){
	// 		_$movable.append( $(this).clone() );
	// 		var itemWidth = _originalItemsWidthsArray[ix];
	// 		_clonedItemsWidthsArray.push(itemWidth);
	// 		_clonedItemsTotalWidth += itemWidth;
	// 	});
	// }

	function setupArrows(){
		_$arrowPrevious = $("<div class='arrow previous' />");
		_$arrowNext = $("<div class='arrow next' />");
		_$arrowPrevious.appendTo(_$element);
		_$arrowNext.appendTo(_$element);

		_$arrowPrevious.click(onArrowPrevious);
		_$arrowNext.click(onArrowNext);

		// $(".arrow", _$element).css("position","absolute");		


		// log(_$arrowNext)
		// _$element.append("<div class='arrowPrevious' />");
		// _$element.append("<div class='arrowNext' />");
		// _$arrowPrevious = $(".arrowPrevious")
	}

	function onArrowPrevious(event){
		if(_clickEnable) movePrevious();
	}

	function onArrowNext(event){
		if(_clickEnable) moveNext();
	}

	function onItemClick(event){
		var ix = $(this).index();
		if(ix===_currentIndex) return;
		//scope on this function is the clicked element
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
		// log("_clickEnable" + _clickEnable);
		log("_currentIndex " + _currentIndex);

		_clickEnable = false;
		removeHighlight(_currentIndex);
		
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

		// //shift the movable to the left if necessary (when moving to previous items)
		// if(toIndex<0){
		// 	shiftMovableAllLeft();
		// 	// _currentIndex=_originalItems.length;			
		// 	toIndex = _currentIndex + indexDif;
		// }

		//shift the movable to the right if necessary
		// if(_currentIndex>=_originalItems.length && toIndex>_currentIndex ){
		// 	shiftMovableAllRight();			
		// 	toIndex = _currentIndex + indexDif;
		// }
		
		animate(_currentIndex,toIndex);

		_currentIndex = toIndex;
		addHighlight(_currentIndex);
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

		// log("difference " + getDifference(fromIndex, toIndex));
		var dif = getDifference(fromIndex, toIndex);
		log("dif " + dif);

		var newLeft = getMovableLeft() + dif;

		log("newLeft " + newLeft);

		_$movable.animate({
			left:newLeft
		},_speed,animateDone);

	}

	function animateDone(){
		_clickEnable = true;
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
		// return _preItemsTotalWidth + _originalItemsTotalWidth + _postItemsTotalWidth;
		return _allItemsTotalWidth;
	}

	function moveMovable(dist){
		setMovableLeft(getMovableLeft() + dist);
	}

	function shiftMovableAllLeft(){
		var shifted = 0;
		while(getMovableRight()>_viewportWidth){
			if( shiftMovableOneLeft() ){
				shifted ++;
			} else{
				break;
			}
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

		while(getMovableLeft()<0){
			if(shiftMovableOneRight()) {
				shifted++;
			}else{
				break;
			}
		}
		return shifted;
	}

	function shiftMovableOneRight(){
		log("shiftMovableOneRight");

		var newCurrentIndex =_currentIndex - _originalItems.length;

		var check1 = getMovableLeft()<0;//there are no items on the left
		var check2 = newCurrentIndex>=0;

		if(check1 && check2 ){
			moveMovable(_originalItemsTotalWidth);
			_currentIndex = newCurrentIndex;
			log("new currentIndex " + _currentIndex);
			return true;
		}else{
			log("Cannot move movable right any further");
			return false;
		}

	}

	function addHighlight(index){
		$("figure",_$element).eq(index).fadeTo(0,1);
	}

	function removeHighlight(index){
		$("figure",_$element).eq(index).fadeTo(0,.5);
	}


	// function reset

	function log(msg){
		if(!_debug) return;
		if(console.log) console.log(msg);
	}

};