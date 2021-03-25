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
    
    preRender: function() {
      this.checkIfResetOnRevisit();
    },

    postRender: function() {
      this.setReadyStatus();

      if(screen.width <= 520) {
        this.$('.panzoom__instruction').html(this.model.get('mobileInstructions'));
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
        this._stageIndex--;

        this.setStageVisible();
        this.zoomMap();
        this.checkControls();
        
        this.$('.panzoom__widget-content').eq(this._stageIndex).a11y_focus();
      }
    },

    onNext: function() {
      if(this._stageIndex <this.model.get('_items').length-1) {
        this._stageIndex++;

        this.setStageVisible();
        this.zoomMap();
        this.checkControls();

        this.$('.panzoom__widget-content').eq(this._stageIndex).a11y_focus();

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

    checkControls: function() {
      if(this._stageIndex === 0 ) {
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
      map.animate({ left: this.panX + '%', top: this.panY + 'rem' }, 1000);
    },

    onStart: function() {
      this.$('.js-panzoom-start').addClass('is-hidden');
      this.$('.js-panzoom-prev').removeClass('is-hidden');
      this.$('.js-panzoom-next').removeClass('is-hidden');

      this.$('.panzoom__image').addClass('scale');
      setTimeout(()=>{ this.onNext(); }, 1500);
    }



  },
  {
    panzoom: 'panzoom'
  });

  return Adapt.register('panzoom', {
    model: ComponentModel.extend({}),// create a new class in the inheritance chain so it can be extended per component type if necessary later
    view: PanzoomView
  });
});
