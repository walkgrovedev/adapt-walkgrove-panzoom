define([
  'core/js/adapt',
  'core/js/views/componentView',
  'core/js/models/componentModel'
], function(Adapt, ComponentView, ComponentModel) {

  var PanzoomView = ComponentView.extend({

    events: {
      'click .js-panzoom-prev': 'onPrev',
      'click .js-panzoom-next': 'onNext',
      'click .js-panzoom-start': 'onStart'
    },
    
    _stageIndex:-1,
    _panX: 50,
    _panY: 50,
    _currentTop: 0,
    
    preRender: function() {
      this.checkIfResetOnRevisit();
    },

    postRender: function() {
      this.setReadyStatus();

      if(screen.width <= 768) {
        this.$('.panzoom__instruction').html(this.model.get('mobileInstruction'));
        this.setCompletionStatus();
      }

      this.$('.panzoom__images').css({'max-width': this.model.get('_graphic')._width + 'px', 'max-height': this.model.get('_graphic')._height + 'px'})
    },

    checkIfResetOnRevisit: function() {
      var isResetOnRevisit = this.model.get('_isResetOnRevisit');

      // If reset is enabled set defaults
      if (isResetOnRevisit) {
        this.model.reset(isResetOnRevisit);
      }
    },

    onPrev: function() {
      if(this._stageIndex > 0) {
        this.$('.panzoom__image-fade').eq(this._stageIndex).addClass('hide');
        this._stageIndex--;

        this.disableControls();

        _.delay(function () {
          this.setStageVisible();
          this.zoomMap();
          //this.checkControls();
          this.$('.panzoom__image-fade').removeClass('show');
          this.$('.panzoom__image-fade').removeClass('hide');
        }.bind(this), 100);
        
        this.$('.panzoom__widget-content').eq(this._stageIndex).a11y_focus();
      } else {
        this.StartEndStage(true);
      }
    },

    onNext: function() {
      if(this._stageIndex < this.model.get('_items').length-2) {
        this.$('.panzoom__image-fade').eq(this._stageIndex).addClass('hide');
        this._stageIndex++;

        this.disableControls();

        _.delay(function () {
          this.setStageVisible();
          this.zoomMap();
          //this.checkControls();
          this.$('.panzoom__image-fade').removeClass('show');
          this.$('.panzoom__image-fade').removeClass('hide');
        }.bind(this), 100);

        this.$('.panzoom__widget-content').eq(this._stageIndex).a11y_focus();
      } else {
        this.StartEndStage(false); 
        if(this._stageIndex === this.model.get('_items').length-1) {
          this.setCompletionStatus();
          this.$('.panzoom__instruction').html(this.model.get('endInstructions'));
        }
      }
    },

    setStageVisible: function() {
      this.model.get('_items').forEach((item, i) => {
        if(this._stageIndex === i) {
          this.$('.panzoom__widget').eq(i).addClass('is-visible');
          this.panX = item._pan._x;
          this.panY = item._pan._y;
        } else {
          this.$('.panzoom__widget').eq(i).removeClass('is-visible');
        }
      });
    },

    disableControls: function() {
      this.$('.js-panzoom-prev').addClass('is-disabled');
      this.$('.js-panzoom-next').addClass('is-disabled');
    },

    checkControls: function() {
      if(this._stageIndex === -1 ) {
        this.$('.js-panzoom-prev').addClass('is-disabled');
      } else {
        this.$('.js-panzoom-prev').removeClass('is-disabled');
      }
      if(this._stageIndex === this.model.get('_items').length-1) {
        this.$('.js-panzoom-next').addClass('is-disabled');
      } else {
        this.$('.js-panzoom-next').removeClass('is-disabled');
      }
    },

    zoomMap: function() {
      const map = this.$('.panzoom__image');
      const mapFade = this.$('.panzoom__image-fade');

      this.$('.panzoom__image').addClass('scaleDown');

      if(this._stageIndex === -1 || this._stageIndex === this.model.get('_items').length-1) {
        
        map.animate({ left: '0%' }, 1000, () => { //top: this.panY + 'rem'
          this._currentTop = '0%';
          map.css('-webkit-transform','scale(1) translate(0%, 0%)');
          //mapFade.css('-webkit-transform','scale(1) translate(0%, 0%)');
          _.delay(function () {
            //mapFade.eq(this._stageIndex).addClass('show'); 
            this.checkControls();
          }.bind(this), 1000);
        });
        mapFade.animate({ left: '0%' }, 1000);
        $({top: this._currentTop}).animate({top: '0%'}, {
          duration: 1000,
          easing: 'linear',
          step: function() {
              map.css('-webkit-transform','scale(1) translate(0%, 0%)');
              //mapFade.css('-webkit-transform','scale(2) translate(0%, ' + this.top + '%)');
          }
        });

        
      } else {

        this.$('.panzoom__image').removeClass('scaleDown');

        map.animate({ left: this.panX + '%' }, 1000, () => { //top: this.panY + 'rem'
          this._currentTop = this.panY;
          map.css('-webkit-transform','scale(2) translate(0%, ' + this._currentTop + '%)');
          mapFade.css('-webkit-transform','scale(2) translate(0%, ' + this._currentTop + '%)');
          _.delay(function () {
            mapFade.eq(this._stageIndex).addClass('show'); 
            this.checkControls();
          }.bind(this), 1000);
        });
        mapFade.animate({ left: this.panX + '%' }, 1000);
        $({top: this._currentTop}).animate({top: this.panY}, {
          duration: 1000,
          easing: 'linear',
          step: function() {
              map.css('-webkit-transform','scale(2) translate(0%, ' + this.top + '%)');
              //mapFade.css('-webkit-transform','scale(2) translate(0%, ' + this.top + '%)');
          }
        });

      }
    },

    onStart: function() {
      this.$('.js-panzoom-start').addClass('is-hidden');
      this.$('.js-panzoom-prev').removeClass('is-hidden');
      this.$('.js-panzoom-next').removeClass('is-hidden');
      this.$('.panzoom__image-small').addClass('is-visible');

      this.$('.panzoom__image').addClass('scale');
      setTimeout(()=>{ this.onNext(); }, 1000);
    },

    StartEndStage: function(_start) {
      this.$('.panzoom__image-fade').eq(this._stageIndex).addClass('hide');

      this.disableControls();

      if(_start) {
        this._stageIndex--;
        //this.$('.panzoom__image').css('-webkit-transform','scale(1) translate(0%, 0%)');
      } else {
        this._stageIndex++;
        //this.$('.panzoom__image').css('-webkit-transform','scale(1) translate(-25%, 0%)');
      }

      _.delay(function () {
        this.setStageVisible();
        this.zoomMap();
        //this.checkControls();
        this.$('.panzoom__image-fade').removeClass('show');
        this.$('.panzoom__image-fade').removeClass('hide');
      }.bind(this), 100);

    }


  },
  {
    template: 'panzoom'
  });

  return Adapt.register('panzoom', {
    model: ComponentModel.extend({}),// create a new class in the inheritance chain so it can be extended per component type if necessary later
    view: PanzoomView
  });
});
