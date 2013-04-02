<h1>Tooltip</h1>

<div class="example">
	<h2>Content Loading</h2>

	<button type="button" class="button tooltip-attr" title="This is the title attribute">Via Title Attribute</button>
	<button type="button" class="button tooltip-base" data-tooltip="This is the data-tooltip attribute">Via Data Attribute (Default)</button>
	<button type="button" class="button tooltip-base" data-tooltip="#hidden">Via DOM Element</button>
	<button type="button" class="button tooltip-ajax" data-tooltip="ajax/tooltip.php">Via AJAX</button>
	<button type="button" class="button tooltip-ajax" data-tooltip="ajax/tooltip.php?slow">Via AJAX w/ Loader</button>

	<div id="hidden" style="display: none">This is loaded from a hidden DOM element</div>
</div>

<div class="example">
	<h2>Effects</h2>

	<button type="button" class="button tooltip-fade" data-tooltip="Tooltip will fade in and out within 250ms">Fade In/Out</button>
	<button type="button" class="button tooltip-click" data-tooltip="Tooltip is shown and hidden with mouse click">Click Toggle</button>
	<button type="button" class="button tooltip-delay" data-tooltip="Tooltip is shown after 300ms">Show Delay</button>
	<button type="button" class="button tooltip-base" data-tooltip="#hidden" title="Custom Title">Title and Content</button>
	<button type="button" class="button tooltip-offset" data-tooltip="Tooltip will have its axis altered">X/Y Offsets</button>
</div>

<div class="example">
	<h2>Positioning</h2>

	<div class="row">
		<button type="button" class="button tooltip-tl" data-tooltip="Positioned at top left">Top Left</button>
		<button type="button" class="button tooltip-tc" data-tooltip="Positioned at top center">Top Center</button>
		<button type="button" class="button tooltip-tr" data-tooltip="Positioned at top right">Top Right (Default)</button>
	</div>

	<div class="row">
		<button type="button" class="button tooltip-cl" data-tooltip="Positioned at center left">Center Left</button>
		<button type="button" class="button tooltip-cc" data-tooltip="Positioned in the center">Center</button>
		<button type="button" class="button tooltip-cr" data-tooltip="Positioned at center right">Center Right</button>
	</div>

	<div class="row">
		<button type="button" class="button tooltip-bl" data-tooltip="Positioned at bottom left">Bottom Left</button>
		<button type="button" class="button tooltip-bc" data-tooltip="Positioned at bottom center">Bottom Center</button>
		<button type="button" class="button tooltip-br" data-tooltip="Positioned at bottom right">Bottom Right</button>
	</div>

	<div class="row">
		<button type="button" class="button tooltip-mouse" data-tooltip="Positioned next to the mouse cursor">Mouse Follow</button>
	</div>
</div>

<div class="example">
	<h2>Events</h2>

	<button type="button" class="button tooltip-event" data-tooltip="Tooltip will have a custom class applied via event callbacks">onShow, onHide</button>
	<button type="button" class="button tooltip-event2" data-tooltip="Activating node will be disabled after tooltip is positioned">onPosition</button>
</div>

<script type="text/javascript">
	window.addEvent('domready', function() {
		Titon.Tooltip.factory('.tooltip-base');
		Titon.Tooltip.factory('.tooltip-attr', { getTitle: false, getContent: 'title' });
		Titon.Tooltip.factory('.tooltip-ajax', { ajax: true });
		Titon.Tooltip.factory('.tooltip-fade', { fade: true });
		Titon.Tooltip.factory('.tooltip-click', { mode: 'click' });
		Titon.Tooltip.factory('.tooltip-delay', { delay: 250 });
		Titon.Tooltip.factory('.tooltip-offset', { xOffset: 15, yOffset: 15 });
		Titon.Tooltip.factory('.tooltip-tl', { position: 'topLeft' });
		Titon.Tooltip.factory('.tooltip-tc', { position: 'topCenter' });
		Titon.Tooltip.factory('.tooltip-tr', { position: 'topRight' });
		Titon.Tooltip.factory('.tooltip-cl', { position: 'centerLeft' });
		Titon.Tooltip.factory('.tooltip-cc', { position: 'center' });
		Titon.Tooltip.factory('.tooltip-cr', { position: 'centerRight' });
		Titon.Tooltip.factory('.tooltip-bl', { position: 'bottomLeft' });
		Titon.Tooltip.factory('.tooltip-bc', { position: 'bottomCenter' });
		Titon.Tooltip.factory('.tooltip-br', { position: 'bottomRight' });
		Titon.Tooltip.factory('.tooltip-mouse', { position: 'mouse' });
		Titon.Tooltip.factory('.tooltip-event', {
			onShow: function() {
				this.node.addClass('success');
			},
			onHide: function() {
				this.node.removeClass('success');
			}
		});
		Titon.Tooltip.factory('.tooltip-event2', {
			onPosition: function() {
				this.node.set('disabled', true);
			}
		});
	});
</script>