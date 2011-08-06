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
	var _originalItemsTotalWidth = 0; //original width of all the figures, no clones counted
	var _originalItems = [];//references to the original figures, no clones here
	var _originalItemsWidthsArray = [];
	var _clonedItemsTotalWidth = 0 ; //total width of the movable area
	var _clonedItemsWidthsArray = [];
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

	//store references to the original elements
		_originalItems = $("figure",_$element);

		//hide the captions
		$("figure figcaption",_$element).hide();
		
	//set up the styles of the elements
		_$element.css("position","relative");
		_$element.css("overflow-x","hidden");
		_$movable.css("position","absolute");
		_originalItems.css("float","left");

	//change the opacity of each image
		_originalItems.fadeTo(0,0.5);

	//make an array with the size of each image
	//store the total width of the images
		$("figure img",_$element).each(function(){
			var w = $(this).width()
			_originalItemsWidthsArray.push(w);
			_clonedItemsWidthsArray.push(w);
			_originalItemsTotalWidth += w;			
		});

	//store the starting width of the movable
		_clonedItemsTotalWidth = _originalItemsTotalWidth;

	//add elements on the right as necessary
	//there has two be two at least
		addSetOnRigth();

	//this has to be necessary to cover the width of 2 viewports
		var tooMany = 0;
		while(_clonedItemsTotalWidth < (_viewportWidth*3) ) {
			tooMany++;
			addSetOnRigth();
			if(tooMany>40){
				log("Too many copies!!!")
				break;
			}
		}

		//check if we still need more items
		//to do later

		//add click listener to elements
		$("figure",_$element).click(onItemClick);
	
	//resize the container
		_$movable.width(_clonedItemsTotalWidth);

		setupArrows();

		addHighlight(0);

	}//init

	function addSetOnRigth(){
		_originalItems.each(function(ix, ele){
			_$movable.append( $(this).clone() );
			var itemWidth = _originalItemsWidthsArray[ix];
			_clonedItemsWidthsArray.push(itemWidth);
			_clonedItemsTotalWidth += itemWidth;
		});
	}

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
		//scope on this function is the clicked element
		moveTo( $(this).index() );
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

		//shift the movable to the left if necessary (when moving to previous items)
		if(toIndex<0){
			shiftMovableAllLeft();
			// _currentIndex=_originalItems.length;			
			toIndex = _currentIndex + indexDif;
		}

		//shift the movable to the right if necessary
		if(_currentIndex>=_originalItems.length && toIndex>_currentIndex ){
			shiftMovableAllRight();			
			toIndex = _currentIndex + indexDif;
		}
		
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
				dif += _clonedItemsWidthsArray[ix];
			}
			return dif;
		}

		if(fromIndex<toIndex){
			log("Forward");
			for(var ix = fromIndex; ix<toIndex; ix++){
				dif += _clonedItemsWidthsArray[ix];
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
		return getMovableLeft() + _clonedItemsTotalWidth;
	}

	function setMovableLeft(left){
		_$movable.css("left",left);
	}

	function moveMovable(dist){
		setMovableLeft(getMovableLeft() + dist);
	}

	function shiftMovableAllLeft(){
		while(getMovableRight()>_viewportWidth){
			if(!shiftMovableOneLeft()) break;
		}
	}

	function shiftMovableOneLeft(){
		log("shiftMovableOneLeft");

		var newCurrentIndex =_currentIndex + _originalItems.length;

		var check1 = (getMovableRight()-_originalItemsTotalWidth) >= _viewportWidth;
		var check2 = newCurrentIndex < _clonedItemsWidthsArray.length;

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

		while(getMovableLeft()<0){
			if(!shiftMovableOneRight()) break;
		}
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