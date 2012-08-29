// slidinator plugin by benjamin cabanes contact@benjamincabanes.com
(function($){
 
    $.fn.extend({
         
        //pass the options variable to the function
        simpleCarousel: function(options) {
 
 
            //Set the default values, use comma to separate the settings, example:
            var defaults = {
                wrap           : '#SCwrap',
                container      : '#SCcontainer',
                items          : '.SCitem',
                previousLink   : '#SCprevious-link',
                nextLink       : '#SCnext-link',
                scrollbar      : '#SCscrollbar',
                tracker        : '#SCtracker',
                transitionType : 'linear',
                duration       : 500
            }
                 
            /* mergin options */
            var options =  $.extend(defaults, options);
 
            /* begining of the plugin */
            return this.each(function() {
                var init = options;

                /** 
                 *   ---------- PLUGIN STRUCTURE ----------
                 * 
                 * 1. Hide overflow-x
                 * 2. Set all vars
                 *   --> set simple vars
                 *   --> set calculate vars (ratios)
                 * 3. Create element if require
                 * 4. Initialize the scrollbar
                 * 5. Set up the buttons
                 * 
                 */

                // hide overflow-x
                $('body').css('overflow-x', 'hidden');

                /* slider vars */
                
                var browserWidth      = $(window).width();
                var Slide = new Object();
                    Slide.wrap        = $(this);
                    Slide.container   = Slide.wrap.find(init.container);
                    Slide.items       = Slide.container.find(init.items);
                    Slide.wrapWidth   = Slide.wrap.width();

                /* buttons vars */
                var previousBtn = Slide.wrap.find(init.previousLink),
                    nextBtn     = Slide.wrap.find(init.nextLink);

                /* scrollbar */
                var Scrollbar                = new Object();
                    Scrollbar.barContainer   = Slide.wrap.find(init.scrollbar);
                    Scrollbar.tracker        = Scrollbar.barContainer.find(init.tracker);
                    Scrollbar.leftOffset     = Scrollbar.barContainer.offset().left;
                    Scrollbar.rightOffset    = Scrollbar.leftOffset + Scrollbar.barContainer.width();
                    Scrollbar.mousecaptured  = false;
                    Scrollbar.trackerWidth   = parseFloat(Scrollbar.barContainer.width() / Slide.items.length);
                    Scrollbar.direction; //direction of the tracker
                var previousCursorPosition   = Scrollbar.leftOffset,
                    trackerPosition;


                /* set the tracker width and intialise the offset (set in the middle) */
                Scrollbar.tracker.width(Scrollbar.trackerWidth);
                var middlePos = (Scrollbar.barContainer.width()-Scrollbar.trackerWidth)/2;
                Scrollbar.tracker.css('left', middlePos+'px');

                Scrollbar.endCourseRight = Scrollbar.rightOffset - (Scrollbar.tracker.width() /2 ); // detect the end of course right
                Scrollbar.endCourseLeft  = Scrollbar.leftOffset + (Scrollbar.tracker.width() /2); // detect the end of course left
                

                /* Interacting */
                if(Slide.container){ //if slide container is setted then, do the work

                    /* push the content sliding to the left side of the window */
                        
                        //calculate the total width of an item
                        // var itemsMargin         = (parseFloat(Slide.items.css('margin-left').replace('px', '')))*2, // must be a float (margin-left*2);
                        // contentSlidingWidth = (Slide.items.width() + itemsMargin) * Slide.items.length; //set content width on all browser window
                        
                        // +margin +border +padding +width
                        var itemWidth = 
                                        ( parseFloat(Slide.items.css('margin-left').replace('px', ''))
                                          + parseFloat(Slide.items.css('border-left-width').replace('px', ''))
                                          + parseFloat(Slide.items.css('padding-left').replace('px', ''))
                                        )*2 + Slide.items.width(),
                            contentSlidingWidth = itemWidth * Slide.items.length; //set content width on all browser window
                        Slide.container.width(contentSlidingWidth).css('left', '-'+ ((contentSlidingWidth - Slide.wrap.width()) /2) +'px' ); // offset
                    /* --- */

                    /* Ratio between slide content and tracker */
                    var leftSlideValue = parseFloat(Slide.container.css('left').replace('px', '')),
                    slideRatio = parseFloat(leftSlideValue / Scrollbar.tracker.position().left);

                    /* Initializing the Scrollbar */

                    /* mousedown */
                    Scrollbar.tracker.mousedown(function(e){
                        Scrollbar.mousecaptured = true;
                        previousCursorPosition = e.pageX;
                    });

                    /* mouseup */
                    Scrollbar.tracker.mouseup(function(e){
                        Scrollbar.mousecaptured = false;
                    });

                    /* general condition */
                    $(document).mousemove(function(e) {
                        if (Scrollbar.mousecaptured) {
                            e.stopPropagation();
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            trackerPositionCalc(e.pageX);
                        }
                    });
                    $(document).mouseup(function(e) {
                        Scrollbar.mousecaptured = false;
                    });

                    /* Move slides when tracker is moving */
                    function trackerPositionCalc(cursorPosition){
                        /* detect the end of container */   
                        if(cursorPosition >= Scrollbar.endCourseLeft && cursorPosition <= Scrollbar.endCourseRight){
                            /* execute the translation */
                            var deplacement = cursorPosition - Scrollbar.leftOffset - (Scrollbar.tracker.width() /2 ); // (tracker.width() /2 ) is for having the cursor in the middle
                            Scrollbar.tracker.css('left', deplacement + 'px');

                            /* Moving content */
                            var deplacementSlide = Scrollbar.tracker.position().left * slideRatio;
                            Slide.container.css('left', deplacementSlide + 'px');
                            
                            /* maybe callback */
                        }

                        /* set the new previousCursorPosition */
                        previousCursorPosition = cursorPosition;

                    }
                    /* end of initializing the scrollbar */

                    /* Previous and Next buttons */
                    previousBtn.bind('click', function(e){
                        e.preventDefault();
                        var leftValue = parseFloat(Slide.container.css('left').replace('px', ''));
                        
                        if(!Slide.container.hasClass('translating')){ //if the slider is moving, do nothing
                            /* limit area test */
                            if( leftValue != 0 || leftValue < 0 ){
                                var distOffset;
                                if(Math.abs(leftValue) < itemWidth) { //test if the distance is more than an item (whitd+margin)
                                    distOffset = Math.abs(leftValue);
                                }else{
                                    distOffset = itemWidth;
                                }

                                Slide.container.addClass('translating').animate({
                                    'left': '+='+distOffset+'px'
                                }, init.duration, init.transitionType, function(){
                                    $(this).removeClass('translating');
                                });

                                /* make offset on scrollbar */
                                Scrollbar.tracker.animate({
                                    'left': '+='+distOffset/slideRatio+'px'
                                }, init.duration, init.transitionType, function(){
                                    //nothing here
                                });
                            }
                        }
                        
                    });
                    nextBtn.bind('click', function(e){
                        e.preventDefault();
                        var leftValue = parseFloat(Slide.container.css('left').replace('px', ''));

                        if(!Slide.container.hasClass('translating')){ //if the slider is moving, do nothing
                            /* limit area test */
                            if( leftValue != -(Slide.container.width()-960) || leftValue < -(Slide.container.width()-960) ){
                                var distOffset;
                                if((Slide.container.width()-960)-Math.abs(leftValue) < itemWidth) { //test if the distance is more than an item (whitd+margin)
                                    distOffset = (Slide.container.width()-960)-Math.abs(leftValue);
                                }else{
                                    distOffset = itemWidth;
                                }

                                Slide.container.addClass('translating').animate({
                                    'left': '-='+distOffset+'px'
                                }, init.duration, init.transitionType, function(){
                                    $(this).removeClass('translating');
                                });

                                /* make offset on scrollbar */
                                Scrollbar.tracker.animate({
                                    'left': '-='+distOffset/slideRatio+'px'
                                }, init.duration, init.transitionType, function(){
                                    //nothing here
                                });
                            }
                        }
                    });
                    /* end of buttons interactions */

                }//end condition
             
            });
        }
    });
     
})(jQuery);