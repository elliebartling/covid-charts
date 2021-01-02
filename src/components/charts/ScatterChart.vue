<script>
	import { Line, mixins } from 'vue-chartjs'
	const { reactiveProp } = mixins
	import { mapState } from 'vuex'

	export default {
		extends: Line,
		mixins: [reactiveProp],
		props: ['max'],
		// data() {
		// 	return {
		// 		options:
		// 	}
		// },
		computed: {
			...mapState(['filteredDates']),
			dates() {
				return this.filteredDates.map(d => d.formatted)
			},
			options() {
				console.log(this.max)
				return {
					responsive: true,
					maintainAspectRatio: true,
					scales: {
							yAxes: [{
									ticks: {
											beginAtZero: true,
											max: this.max
									}
							}]
					},
					tooltips: {
						intersect: false,
						mode: 'index',
						backgroundColor: "#343a40",
						titleFont: {
							style: 'bold',
							color: '#FFF'
						},
						titleFontColor: "#FFF",
						titleFontSize: 16,
						bodyFont: {
							size: 10,
							color: "#FFFFFF"
						},
						bodySpacing: 6,
						xPadding: 10,
						yPadding: 10,
						cornerRadius: 1,
						borderColor: "rgba(0,0,0, 0.2)",
						borderWidth: 0
					}
				}
			}
		},
		methods: {
			getOrCreateTooltip (chart) {
				var tooltipEl = chart.canvas.parentNode.querySelector('div')

				if (!tooltipEl) {
					tooltipEl = document.createElement('div')
					tooltipEl.classList.add('chartjs-tooltip')
					tooltipEl.innerHTML = '<table></table>'
					chart.canvas.parentNode.appendChild(tooltipEl)
				}

				return tooltipEl
			},
			customTooltip(context) {
				console.log(context)
				// Tooltip Element
				var chart = context.chart
				var tooltipEl = this.getOrCreateTooltip(chart)

				// Hide if no tooltip
				var tooltip = context.tooltip
				if (tooltip.opacity === 0) {
					tooltipEl.style.opacity = 0;
					return;
				}

				// Set caret Position
				tooltipEl.classList.remove('above', 'below', 'no-transform')
				if (tooltip.yAlign) {
					tooltipEl.classList.add(tooltip.yAlign)
				} else {
					tooltipEl.classList.add('no-transform')
				}

				function getBody(bodyItem) {
					return bodyItem.lines
				}

				// Set Text
				if (tooltip.body) {
					var titleLines = tooltip.title || []
					var bodyLines = tooltip.body.map(getBody)

					var innerHtml = '<thead>'

					titleLines.forEach(function(title) {
						innerHtml += '<tr><th>' + title + '</th></tr>'
					});
					innerHtml += '</thead><tbody>'

					bodyLines.forEach(function(body, i) {
						var colors = tooltip.labelColors[i]
						var style = 'background:' + colors.backgroundColor
						style += '; border-color:' + colors.borderColor
						style += '; border-width: 2px'
						var span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>'
						innerHtml += '<tr><td>' + span + body + '</td></tr>'
					});
					innerHtml += '</tbody>'

					var tableRoot = tooltipEl.querySelector('table')
					tableRoot.innerHTML = innerHtml
				}

				var positionY = chart.canvas.offsetTop
				var positionX = chart.canvas.offsetLeft

				// Display, position, and set styles for font
				tooltipEl.style.opacity = 1;
				tooltipEl.style.left = positionX + tooltip.caretX + 'px'
				tooltipEl.style.top = positionY + tooltip.caretY + 'px'
				tooltipEl.style.font = tooltip.options.bodyFont.string
				tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px'
			}
		},
		mounted () {
			this.renderChart(this.chartData, this.options)
		}
	}
</script>

<style lang="css">
</style>
