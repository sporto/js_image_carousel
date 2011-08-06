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
	var _currentItem = 0;
	var _$arrowPrevious;
	var _$arrowNext;
	var _clickEnable=true;

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
		while(_clonedItemsTotalWidth < (_viewportWidth*2) ) {
			addSetOnRigth();
		}

		//check if we still need more items
		//to do later

		//add click listener to elements
		$("figure",_$element).click(onItemClick);
	
	//resize the container
		_$movable.width(_clonedItemsTotalWidth);

		setupArrows();

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
		moveTo( _currentItem + dir);
	}

	function moveTo(index){
		log( "moveTo " + index );
		log("_clickEnable" + _clickEnable);

		_clickEnable = false;
		
		if(index===_currentItem) return;

		if(index<0){
			shiftLeft();
			_currentItem=_originalItems.length;
			index = _currentItem-1;
		}

		animate(_currentItem,index);
	}

	function getDifference(fromIndex,toIndex){
		if(fromIndex===toIndex) return 0;

		var dif = 0;

		if(fromIndex>toIndex){
			for(var ix = toIndex; ix<fromIndex; ix++){
				dif += _clonedItemsWidthsArray[ix];
			}
			return dif;
		}

		if(fromIndex<toIndex){
			for(var ix = fromIndex; ix<toIndex; ix++){
				dif += _clonedItemsWidthsArray[ix];
			}
			return -dif;
		}
	}

	function animate(fromIndex,toIndex){
		// log("fromIndex " + fromIndex);
		// log("toIndex" + toIndex);

		// log("difference " + getDifference(fromIndex, toIndex));
		var dif = getDifference(fromIndex, toIndex);

		shiftMovable(dif);
		_currentItem = toIndex;

		animateDone();
	}

	function animateDone(){
		_clickEnable = true;
	}

	function getMovableLeft(){
		return _$movable.position().left;
	}

	function setMovableLeft(left){
		_$movable.css("left",left);
	}

	function shiftMovable(dist){
		setMovableLeft(getMovableLeft() + dist);
	}

	function shiftLeft(){
		shiftMovable( - _originalItemsTotalWidth);
	}

	// function reset

	function log(msg){
		if(console.log) console.log(msg);
	}

};