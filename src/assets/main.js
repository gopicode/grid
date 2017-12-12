const h = React.createElement;

class Grid extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.init();
		this.calculate();
	}

	init() {
		const props = this.props;
		let numRows = props.head.length + props.body.length;
		let numCols = 0;
		props.head[0].forEach(item => {
			numCols += (item.colspan || 1);
		})

		// all the dimensions needed for layouting
		this.dim = {
			lineThick: 1,
			numCols,
			numRows,
			cols: [],
			rows: [],
			fixedRows: {length: props.head.length},
			fixedCols: {length: 1}
		};

		this.syncScroll = this.syncScroll.bind(this);
		this.onCellChange = this.onCellChange.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		document.addEventListener('mousemove', this.onMouseMove.bind(this));
		document.addEventListener('mouseup', this.onMouseUp.bind(this));
	}

	syncScroll(e) {
		let $rpane = this.$box.querySelector('.grid-rpane-hd');
		$rpane.scrollLeft = e.target.scrollLeft;
	}

	onCellChange(e) {
		const $elem = e.target;
		const rowId = $elem.getAttribute('data-rowid');
		const fieldName = $elem.getAttribute('data-field-name');
		// console.log('cell change', rowId, fieldName, $elem.value);
		if (typeof this.props.onChange === 'function') {
			this.props.onChange({id: rowId, name: fieldName, value: $elem.value});
		}
	}

	onMouseDown(e) {
		const type = e.target.getAttribute('data-type');
		if (['hline', 'vline'].indexOf(type) === -1) return;
		const index = +e.target.getAttribute('data-index');

		this.drag = {
			type,
			index,
			startX: e.clientX,
			startY: e.clientY
		};
		this.isDragging = true;
	}

	onMouseUp(e) {
		if (!this.isDragging) return;
		if (!this.drag) return;

		this.isDragging = false;
		const type = this.drag.type;
		const index = this.drag.index;
		const selector = '.' + type + '-' + index;

		if (type === 'vline') {
			let style = this.dim.vlines[index];
			let dx = e.clientX - this.drag.startX;
			this.dim.cols[index - 1].width += dx;
			this.calculate();
			this.setState({rand: Math.random()}); // trigger re-render
		}
		else if (type === 'hline') {
			let style = this.dim.hlines[index];
			let dy = e.clientY - this.drag.startY;
			this.dim.rows[index - 1].height += dy;
			this.calculate();
			this.setState({rand: Math.random()}); // trigger re-render
		}
	}

	onMouseMove(e) {
		if (!this.isDragging) return;

		const type = this.drag.type;
		const index = this.drag.index;
		const selector = '.' + type + '-' + index;

		if (type === 'vline') {
			let style = this.dim.vlines[index];
			let dx = e.clientX - this.drag.startX;

			// vertical lines are duplicated in head (fixed rows) and body panes. move both
			const $lines = this.$box.querySelectorAll(selector);
			Array.from($lines).forEach($line => {
				$line.style.left = (style.left + dx) + 'px';
				$line.style.top = (style.top) + 'px';
			});
		}
		else if (type === 'hline') {
			let style = this.dim.hlines[index];
			let dy = e.clientY - this.drag.startY;

			// horizontal lines are duplicated in left (fixed cols) and right panes. move both
			const $lines = this.$box.querySelectorAll(selector);
			Array.from($lines).forEach($line => {
				$line.style.left = (style.left) + 'px';
				$line.style.top = (style.top + dy) + 'px';
			});
		}
	}

	calculate() {
		const defaultColWidth = 100;
		const defaultRowHeight = 20;
		const lineThick = this.dim.lineThick;

		this.dim.vlines = [];
		this.dim.totalWidth = 0;
		this.dim.fixedCols.width = 0;
		for (let i = 0; i < this.dim.numCols; i += 1) {
			let width = this.dim.cols[i] ? this.dim.cols[i].width : defaultColWidth;
			this.dim.cols[i] = {width};
			this.dim.totalWidth += width + lineThick;
			if (i < this.dim.fixedCols.length) {
				this.dim.fixedCols.width += width + lineThick;
			}
		}

		this.dim.hlines = [];
		this.dim.totalHeight = 0;
		this.dim.fixedRows.height = 0;
		for (let i = 0; i < this.dim.numRows; i += 1) {
			let height = this.dim.rows[i] ? this.dim.rows[i].height : defaultRowHeight;
			this.dim.rows[i] = {height};
			this.dim.totalHeight += height + lineThick;
			if (i < this.dim.fixedRows.length) {
				this.dim.fixedRows.height += height + lineThick;
			}
		}
	}

	render() {
		const props = this.props;
		const lineThick = this.dim.lineThick;

		const vlinesLeft = [];
		const vlinesRight = [];

		const hlinesHead = [];
		const hlinesBody = [];

		const cellsHeadFixed = [];
		const cellsHeadScroll = [];
		const cellsBodyFixed = [];
		const cellsBodyScroll = [];

		// vertical lines
		var x = 0;
		for (var i = 1; i < (this.dim.numCols); i += 1) {
			// reset x after crossing fixed cols
			if (i == this.dim.fixedCols.length + 1) {
				x = 0;
			}
			x += (this.dim.cols[i - 1].width + lineThick);
			let style = {left: x, top: 0};
			let key = 'vline-' + i;
			let attrs = {
				'data-index': i,
				'data-type': 'vline',
				key,
				className: ['grid-vline', key].join(' '),
				style,
				onMouseDown: this.onMouseDown
			};
			this.dim.vlines[i] = style;
			let line = h('div', attrs);
			(i <= this.dim.fixedCols.length) ? vlinesLeft.push(line) : vlinesRight.push(line);
		}

		// horizontal lines
		var y = 0;
		for (var i = 1; i < (this.dim.numRows); i += 1) {
			// reset y after crossing fixed rows
			if (i == this.dim.fixedRows.length + 1) {
				y = 0;
			}
			y += (this.dim.rows[i - 1].height + lineThick);
			let style = {left: 0, top: y};
			let key = 'hline-' + i;
			let attrs = {
				'data-index': i,
				'data-type': 'hline',
				key,
				className: ['grid-hline', key].join(' '),
				style,
				onMouseDown: this.onMouseDown
			};
			this.dim.hlines[i] = style;
			let line = h('div', attrs);
			(i <= this.dim.fixedRows.length) ? hlinesHead.push(line) : hlinesBody.push(line);
		}

		// cells - head
		this.dim.rtot = 0;
		for (var i = 0; i < props.head.length; i += 1) {
			let r = i;
			let c = 0;
			let cols = props.head[i];
			let j = 0;

			// fixed pane
			this.dim.ctot = 0;
			while (c < this.dim.fixedCols.length) {
				let item = cols[j];
				let cspan = item.colspan || 1;
				let cell = this.renderCell(item, r, c, {type: 'head'});
				cellsHeadFixed.push(cell);
				c += cspan;
				j += 1;
			}

			// scrollable pane
			this.dim.ctot = 0;
			while (c < this.dim.numCols) {
				let item = cols[j];
				let cspan = item.colspan || 1;
				let cell = this.renderCell(item, r, c, {type: 'head'});
				cellsHeadScroll.push(cell);
				c += cspan;
				j += 1;
			}

			this.dim.rtot += this.dim.rows[r].height + lineThick;
		}

		// cells - body
		this.dim.rtot = 0;
		for (var i = 0; i < props.body.length; i += 1) {
			let r = i + props.head.length;
			let c = 0;
			let row = props.body[i];
			let cols = row.cells;
			let j = 0;

			// fixed pane
			this.dim.ctot = 0;
			while (c < this.dim.fixedCols.length) {
				let item = cols[j];
				let cspan = item.colspan || 1;
				let cell = this.renderCell(item, r, c, {rowId: row.id});
				cellsBodyFixed.push(cell);
				c += cspan;
				j += 1;
			}

			// scrollable pane
			this.dim.ctot = 0;
			while (c < this.dim.numCols) {
				let item = cols[j];
				let cspan = item.colspan || 1;
				let cell = this.renderCell(item, r, c, {rowId: row.id});
				cellsBodyScroll.push(cell);
				c += cspan;
				j += 1;
			}

			this.dim.rtot += this.dim.rows[r].height + lineThick;
		}

		const fixedHeight = this.dim.fixedRows.height;
		const bodyHeight = 'calc(100% - ' + fixedHeight + 'px)';
		const scrollHeight = this.dim.totalHeight - fixedHeight;

		const headStyle = {height: fixedHeight, position: 'relative'};
		const bodyStyle = {height: bodyHeight, position: 'relative', overflow: 'scroll', top: 1};

		const fixedWidth = this.dim.fixedCols.width;
		const bodyWidth = 'calc(100% - ' + fixedWidth + 'px)';
		const scrollWidth = this.dim.totalWidth - fixedWidth;

		const leftStyle = {height: '100%', width: fixedWidth, position: 'absolute', top: 0, left: 0};
		const rightStyle = {height: '100%', width: bodyWidth, position: 'absolute', top: 0, left: fixedWidth + 1};
		// 1px additional height to reveal the last horizontal line. because the div's overflow is hidden to keep the scroll in sync
		const rightStyleHead = {...rightStyle, height: 'calc(100% + 1px)', overflow: 'hidden'};
		const rightStyleBody = {...rightStyle, overflow: 'scroll'};

		return h('div', {className: 'grid-box', ref: elem => this.$box = elem},
			h('div', {style: headStyle},
				h('div', {style: leftStyle}, hlinesHead, vlinesLeft, cellsHeadFixed),
				h('div', {style: rightStyleHead, className: 'grid-rpane-hd'},
					h('div', {style:{position: 'relative', width: scrollWidth, height: '100%'}}, hlinesHead, vlinesRight, cellsHeadScroll)
				)
			),
			h('div', {style: bodyStyle},
				h('div', {style:{position: 'relative', height: scrollHeight}},
					h('div', {style: leftStyle}, hlinesBody, vlinesLeft, cellsBodyFixed),
					h('div', {style: rightStyleBody, onScroll: this.syncScroll},
						h('div', {style:{position: 'relative', width: scrollWidth, height: '100%'}}, hlinesBody, vlinesRight, cellsBodyScroll)
					)
				)
			)
		);
	}

	renderCell(item, r, c, opts = {}) {
		const field = this.props.fields[c];

		let lineThick = this.dim.lineThick;
		let cspan = item.colspan || 1;
		let rspan = item.rowspan || 1;
		let cell = null;

		// rtot and ctot are the running total of row/col position respectively
		let left = this.dim.ctot + 1;
		let top = this.dim.rtot + 1;

		// calculate width including the spanned columns
		let width = 0;
		for (var i = 0; i < cspan; i += 1) {
			if (i > 0) width += lineThick;
			width += this.dim.cols[c + i].width;
		}

		// calculate width including the spanned rows
		let height = 0;
		for (var i = 0; i < rspan; i += 1) {
			if (i > 0) height += lineThick;
			height += this.dim.rows[r + i].height;
		}

		if (!item.empty) {
			let key = ['cell', r, c].join('-');
			let className = ['grid-cell', key];
			// bring the cell above grid line
			if (cspan > 1 || rspan > 1) {
				className.push('grid-cell-above')
			}
			let attrs = {
				key,
				className: className.join(' '),
				style: {left, top, width, height}
			};
			let val;
			if (opts.type !== 'head' && field.editable) {
				val = h('input', {
					type: 'text',
					className: 'grid-cell-edit',
					defaultValue: item.value,
					'data-rowid': opts.rowId,
					'data-field-name': field.name,
					onChange: this.onCellChange
				});
			} else {
				val = h('span', {className: 'grid-cell-span'}, item.value);
			}
			cell = h('div', attrs, val);
		}

		// only there will be empty items in place of rowspan-ed cells.
		// so, advance the column position/index always
		this.dim.ctot += width + lineThick;

		return cell;
	}
}

function Main() {
	return h('div', null,
		h('h5', null, 'Fake Data'),
		h('div', {className: 'fake-data'},
			h(Grid, {fields: sampleFields, head: sampleHead, body: sampleBody})
		)
	);
}

function init() {
	ReactDOM.render(h(Main), document.getElementById('root'));
}

init();