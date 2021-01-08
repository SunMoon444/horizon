/*
* 扩展jqueryui
* */
(function (root, factory) {
    if(typeof define === 'function' && define.amd) {
        define('horizonJqueryui', ['jquery', 'jqueryUi'], factory);
    }else {
        factory(root.jQuery);
    }
}(this, function($) {
    "use strict";
    $.widget("ui.dialog", $.ui.dialog, {
        options: $.extend($.ui.dialog.options, {
            modal: true,
            resizable: false,
            position: {
                using: function( pos ) {
                    var topOffset = $( this ).css( pos ).offset().top;
                    if ( topOffset < 0 ) {
                        $( this ).css( "top", pos.top - topOffset );
                    }else if(topOffset > 100) {
                        $( this ).css( "top", pos.top - 30 );
                    }
                }
            },

            //自定义添加属性
            addCloseBtn: true, //添加关闭按钮
            titleHtml: false, //TITLE内容为HTML
            dialogHtml: null, //弹出框内容HTML
            dialogText: null, //弹出框TEXT
            dialogTextType: null, //弹出框TEXT 类型
            destroyAfterClose: true, //关闭后自动销毁
            cancelDrag: null //不触发拖拽元素
        }),
        _title: function($title) {
            var title = this.options.title;
            if(title) {
            	if( ('titleHtml' in this.options) && this.options.titleHtml == true ) {
                    $title.html(title);
                }else {
                    title = '<div class="widget-header widget-header-flat widget-header-small"><h5 class="bigger"> ' + title + ' </h5></div>';
                    $title.html(title);
                }
            }else {
            	$title.parent().remove();
            }
        },
        _setOptions: function(options) {
            if($.type(options.buttons) === "undefined") {
                options.buttons = [];
            }
            return this._super(options);
        },
        _createButtons: function() {
            var that = this,
                buttons = this.options.buttons;

            this.uiDialogButtonPane.remove();
            this.uiButtonSet.empty();
            if ( ($.isEmptyObject( buttons ) || ($.isArray(buttons) && !buttons.length)) && !this.options.addCloseBtn ) {
                this.uiDialog.removeClass( "ui-dialog-buttons" );
                return;
            }
            function _addButton() {
                $.each( buttons, function( name, props ) {
                    var click, buttonOptions;
                    props = $.isFunction( props ) ?
                    { click: props, text: name } :
                        props;
                    // Default to a non-submitting button
                    props = $.extend( { type: "button" }, props );
                    // Change the context for the click callback to be the main element
                    click = props.click;
                    props.click = function() {
                        click.apply( that.element[ 0 ], arguments );
                    };
                    buttonOptions = {
                        icons: props.icons,
                        text: props.showText
                    };
                    delete props.icons;
                    delete props.showText;
                    $( "<button></button>", props )
                        .button( buttonOptions )
                        .appendTo( that.uiButtonSet );
                });
            }
            if($.isArray(buttons) && buttons.length) {
                $.each(buttons, function(i, button) {
                    button['class'] = 'btn btn-xs no-margin-top no-margin-bottom ' + button['class'];
                });
                _addButton();
            }
            if(this.options.addCloseBtn) {
                buttons = [{
                    html: this.options.closeText,
                    'class' : 'btn btn-xs no-margin-top no-margin-bottom',
                    click: function() {
                        $(this).dialog('close');
                    }
                }];
                _addButton();
            }

            this.uiDialog.addClass( "ui-dialog-buttons" );
            this.uiDialogButtonPane.appendTo( this.uiDialog );
        },
        _create: function() {
            if('dialogHtml' in this.options && this.options.dialogHtml) {
                if($.type(this.options.dialogHtml) === "string") {
                    this.element.html(this.options.dialogHtml);
                }else if($.type(this.options.dialogHtml) === "object") {
                    this.element.append(this.options.dialogHtml);
                }
            }else if('dialogText' in this.options && this.options.dialogText) {
                var dialogText = this.options.dialogText;
                if('dialogTextType' in this.options) {
                    dialogText = '<div class="alert ' + this.options.dialogTextType + ' no-margin">' + dialogText + '</div>';
                }
                this.element.html(dialogText);
            }
            this.element.removeClass('hidden').removeClass('hide');
            return this._super();
        },
        _makeDraggable: function() {
            var that = this,
                options = this.options;

            function filteredUi( ui ) {
                return {
                    position: ui.position,
                    offset: ui.offset
                };
            }
            var cancelDragArr = ['.ui-dialog-content', '.ui-dialog-titlebar-close'];
            if(options.cancelDrag) {
                cancelDragArr.push(options.cancelDrag);
            }
            this.uiDialog.draggable({
                cancel: cancelDragArr.join(','),
                handle: ".ui-dialog-titlebar",
                containment: "document",
                start: function( event, ui ) {
                    $( this ).addClass( "ui-dialog-dragging" );
                    that._blockFrames();
                    that._trigger( "dragStart", event, filteredUi( ui ) );
                },
                drag: function( event, ui ) {
                    that._trigger( "drag", event, filteredUi( ui ) );
                },
                stop: function( event, ui ) {
                    var left = ui.offset.left - that.document.scrollLeft(),
                        top = ui.offset.top - that.document.scrollTop();

                    options.position = {
                        my: "left top",
                        at: "left" + (left >= 0 ? "+" : "") + left + " " +
                            "top" + (top >= 0 ? "+" : "") + top,
                        of: that.window
                    };
                    $( this ).removeClass( "ui-dialog-dragging" );
                    that._unblockFrames();
                    that._trigger( "dragStop", event, filteredUi( ui ) );
                }
            });
        },
        close: function() {
            this._super();
            if(this.options.destroyAfterClose) {
                this.element.dialog('destroy');
            }
        },
        _destroy: function() {
            this.element.addClass('hidden');
            if(('dialogHtml' in this.options && this.options.dialogHtml) ||
                ('dialogText' in this.options && this.options.dialogText)
              ) {
                this.element.html('');
            }
            return this._super();
        },
        _createOverlay: function() {
            if ( !this.options.modal ) {
                return;
            }

            // We use a delay in case the overlay is created from an
            // event that we're going to be cancelling (#2804)
            var isOpening = true;
            this._delay(function() {
                isOpening = false;
            });

            if ( !this.document.data( "ui-dialog-overlays" ) ) {

                // Prevent use of anchors and inputs
                // Using _on() for an event handler shared across many instances is
                // safe because the dialogs stack and must be closed in reverse order
                this._on( this.document, {
                    focusin: function( event ) {
                        if ( isOpening ) {
                            return;
                        }

                        if ( !this._allowInteraction( event ) ) {
                            event.preventDefault();
                            //update by zhouwf 注释下一行代码解决IE中弹出框内的bootstrap-datetimepicker无法选择问题
                            //this._trackingInstances()[ 0 ]._focusTabbable();
                        }
                    }
                });
            }

            this.overlay = $( "<div>" )
                .addClass( "ui-widget-overlay ui-front" )
                .appendTo( this._appendTo() );
            this._on( this.overlay, {
                mousedown: "_keepFocus"
            });
            this.document.data( "ui-dialog-overlays",
                    (this.document.data( "ui-dialog-overlays" ) || 0) + 1 );
        }
    });
}));

