;(function($, win) {
    'use strict';

    var pluginName = 'Dropdowns';
    var defaults = {
        active_class : 'option-selected',
        mobile : false,
        $fn : $.noop,
    };

    function DP(el, options) {
        this.$el = $(el);
        this.el = el;
        this.o = $.extend({}, defaults, options );
        this.init();
    }

    DP.prototype = {

        init : function() {
            this.checkMobile();
            // this.sizeDP();
            this.buildContainer();
            this.buildOptions();
            this.select_action();
            this.click_action();
            this.do_dropdown();
            this.update_selected();
            this.windowResize();
        },

        checkMobile: function() {
            // Adapted from http://www.detectmobilebrowsers.com
            var ua = navigator.userAgent || navigator.vendor || window.opera;
            // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
            this.o.mobile = (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
        },

        windowResize: function() {
            var timer;
            $(window).on('resize load', $.proxy(function() {
                clearTimeout(timer);
                timer = setTimeout($.proxy(function() {
                    // check for mobile
                    this.checkMobile();

                    // If were on a mobile device
                    if( this.o.mobile) {
                        this.mobileActions();
                    } else {
                        this.unmobileActions();
                    }

                    this.o.$fn.call(this.$el);
                }, this), 500);
            }, this));
        },

        buildContainer : function() {
            var ids = this.$el.data('id') ? this.$el.data('id') : '';
            var classes = this.$el.data('class') ? this.$el.data('class') : '';
            classes += ' dropdown-container';

            this.$el.wrap('<div class="' + classes + '" id="' + ids + '"></div>');
            this.$el.after('<div class="dp-trigger"></div>');
            this.$el.siblings('.dp-trigger').append('<div class="dp-value"></div>');
            this.$el.siblings('.dp-trigger').append('<div class="dp-target"></div>');
            this.$el.parent().append('<div class="dp-options"></div>');
        },

        buildOptions: function() {
            //gather the options

            var opt = this.$el.find('option').map(function() {
                // console.log(this.value);
                return {
                    'value' : this.value,
                    'label' : this.innerHTML
                 };
            }).get();

            var bucket = '';
            for( var object in opt ) {
                // console.log(object);
                bucket += '<li data-value="' + opt[object].value + '">' + opt[object].label + '</li>';
            }

            this.$el.siblings('.dp-options').append('<ul>' + bucket + '</ul>');
        },

        placeholder: function() {
            if ( this.$el.val() === '' ) {
                var placeholder = this.$el.find('option').eq(1).val();
                this.$el.find('option').eq(1).remove();
                return placeholder;
            } else {
                return this.$el.val();
            }
        },

        select_action: function() {
            var self = this;
            this.$el.on('change', function() {
                var $this = $(this);
                self.update_selected();
            });
        },

        update_selected: function() {
            // Get the select box val
            var selected_value = this.placeholder();
            // Find the selected option in the dp-options
            var dpOptions = this.$el.siblings('.dp-options').find('[data-value="' + selected_value + '"]');
            // remove selected class from sibilings
            dpOptions.siblings().removeClass(this.o.active_class);
            // Add selected class to this
            dpOptions.addClass(this.o.active_class);
            // Get the label text
            var label = dpOptions.html();
            // Update the label in the options label
            this.$el.siblings('.dp-trigger').find('.dp-value').html('<p>' + label + '</p>');
        },

        click_action: function() {
            var self = this;
            this.$el.siblings('.dp-options').find('li').on('click', function() {
                var $this = $(this);
                var value = $this.data('value');
                $this.parents('.dp-options').siblings('select').val(value).click();

                $this.parents('.dp-options').hide();

                self.update_selected();
            });

            $('html').on('click', function(e) {
                if( !$(e.target).closest('.dropdown-container').length ) {
                    $('.dp-options').hide();
                }
            });
        },

        do_dropdown: function() {
            if ( this.o.mobile && this.$el.data('native') !== false ) return false;
            this.$el.siblings('.dp-trigger').on('click', function() {
                var $this = $(this);
                var $dp = $this.siblings('.dp-options');

                if( $dp.is(':visible') ) {
                    $dp.hide();
                    return;
                }

                // Hide all other options
                $('.dp-options').css('z-index', 0).hide();
                // Show this options
                $dp.css('z-index', 99).show();
            });
        },

        getDim: function() {
            var arr = [];
            arr['winH'] = $(win).innerHeight();
            arr['liHeight'] = 40;

            return arr;
        },

        sizeDP: function() {
            var self = this;
            setTimeout(function() {
                if ( !$('.dp-options').length ) {
                    self.sizeDP();
                } else {
                    var dims = self.getDim();
                    var remaingHeight = dims.winH - self.$el.offset().top;
                    // If li's fit in current window where done here
                    var lis = self.$el.siblings('.dp-options').find('li');
                    var lisHeight = lis.map(function() {
                        return $(this).width();
                    }).get();
                    // console.log(lisHeight);
                }
            },1000);
        },

        mobileActions: function() {
            $('.dropdown-container').addClass('dp-mobile');
        },

        unmobileActions: function() {
            $('.dropdown-container').removeClass('dp-mobile');
        }
    };

    $.fn.dropdown = function(options) {
        return this.each(function() {
            if( !$.data(this, pluginName) ) {
                $.data(this, pluginName, new DP(this, options));
            }
        });
    };

})(jQuery, window);