viewModel.pivot = new Object()
let pvt = viewModel.pivot

pvt.pivotModel = [
    { field: '_id', type: 'string', name: 'ID', as: 'dimension' },

    { field: 'PC._id', type: 'string', name: 'Profit Center - ID', as: 'dimension' },
    { field: 'PC.EntityID', type: 'string', name: 'Profit Center - Entity ID' },
    { field: 'PC.Name', type: 'string', name: 'Profit Center - Name' },
    { field: 'PC.BrandID', type: 'string', name: 'Profit Center - Brand ID' },
    { field: 'PC.BrandCategoryID', type: 'string', name: 'Profit Center - Brand Category ID' },
    { field: 'PC.BranchID', type: 'string', name: 'Profit Center - Branch ID' },
    { field: 'PC.BranchType', type: 'int', name: 'Profit Center - Branch Type' },

    { field: 'CC._id', type: 'string', name: 'Cost Center - ID', as: 'dimension' },
    { field: 'CC.EntityID', type: 'string', name: 'Cost Center - Entity ID' },
    { field: 'CC.Name', type: 'string', name: 'Cost Center - Name' },
    { field: 'CC.CostGroup01', type: 'string', name: 'Cost Center - Cost Group 01' },
    { field: 'CC.CostGroup02', type: 'string', name: 'Cost Center - Cost Group 02' },
    { field: 'CC.CostGroup03', type: 'string', name: 'Cost Center - Cost Group 03' },
    { field: 'CC.BranchID', type: 'string', name: 'Cost Center - Branch ID' },
    { field: 'CC.BranchType', type: 'string', name: 'Cost Center - Branch Type' },
    { field: 'CC.CCTypeID', type: 'string', name: 'Cost Center - Type' },
    { field: 'CC.HCCGroupID', type: 'string', name: 'Cost Center - HCC Group ID' },

    { field: 'CompanyCode', type: 'string', name: 'Company Code', as: 'dimension' },
    { field: 'LedgerAccount', type: 'string', name: 'Ledger Account', as: 'dimension' },

    { field: 'Customer._id', type: 'string', name: 'Customer - ID', as: 'dimension' },
    { field: 'Customer.CustomerID', type: 'string', name: 'Customer - Customer ID' },
    { field: 'Customer.Plant', type: 'string', name: 'Customer - Plant' },
    { field: 'Customer.Name', type: 'string', name: 'Customer - Name' },
    { field: 'Customer.KeyAccount', type: 'string', name: 'Customer - Key Account' },
    { field: 'Customer.Channel', type: 'string', name: 'Customer - Channel' },
    { field: 'Customer.Group', type: 'string', name: 'Customer - Group' },
    { field: 'Customer.National', type: 'string', name: 'Customer - National' },
    { field: 'Customer.Zone', type: 'string', name: 'Customer - Zone' },
    { field: 'Customer.Region', type: 'string', name: 'Customer - Region' },
    { field: 'Customer.Area', type: 'string', name: 'Customer - Area' },

    { field: 'Product._id', type: 'string', name: 'Product - ID', as: 'dimension' },
    { field: 'Product.Name', type: 'string', name: 'Product - Name' },
    { field: 'Product.Config', type: 'string', name: 'Product - Config' },
    { field: 'Product.Brand', type: 'string', name: 'Product - Brand' },
    { field: 'Product.LongName', type: 'string', name: 'Product - Long Name' },

    { field: 'Data.ID', type: 'string', name: 'Data - ID', as: 'dimension' },
    { field: 'Data.Month', type: 'string', name: 'Data - Month' },
    { field: 'Data.Quarter', type: 'int', name: 'Data - Quarter' },
    { field: 'Data.Year', type: 'int', name: 'Data - Year' },

    { field: 'Value1', type: 'string', name: 'Value 1', as: 'data point' },
    { field: 'Value2', type: 'string', name: 'Value 2', as: 'data point' },
    { field: 'Value3', type: 'string', name: 'Value 3', as: 'data point' }
]

pvt.templateDataPoint = {
	aggr: 'sum',
	expand: false,
	field: '',
	name: ''
}
pvt.templateRowColumn = {
	field: '',
	name: '',
	expand: false
}
pvt.optionDimensions = ko.observableArray([
	{ field: 'Branch/RD', name: 'Branch/RD' },
	{ field: 'Channel', name: 'Channel' },
	{ field: 'Geography', name: 'Geography' },
	{ field: 'Product', name: 'Product' },
	{ field: 'Time', name: 'Time' },
	{ field: 'Cost Type', name: 'Cost Type' },
	{ field: 'Function', name: 'Function' }
])
pvt.optionRows = ko.observableArray([
	{ field: 'Outlet', name: 'Outlet' },
	{ field: 'SKU', name: 'SKU' },
	{ field: 'PC', name: 'PC' },
	{ field: 'CC', name: 'CC' },
	{ field: 'G/L', name: 'G/L' }
])
pvt.optionDataPoints = ko.observableArray([
    { field: 'Value1', name: 'Value 1' },
    { field: 'Value2', name: 'Value 2' },
    { field: 'Value3', name: 'Value 3' }
])
pvt.optionAggregates = ko.observableArray([
	{ aggr: 'avg', name: 'Avg' },
	// { aggr: 'count', name: 'Count' },
	{ aggr: 'sum', name: 'Sum' },
	{ aggr: 'max', name: 'Max' },
	{ aggr: 'min', name: 'Min' }
])
pvt.dimensions = ko.observableArray([
	app.koMap({
		field: pvt.optionDimensions()[1].field,
		name: pvt.optionDimensions()[1].name,
		expand: false
	}),
	app.koMap({
		field: pvt.optionDimensions()[2].field,
		name: pvt.optionDimensions()[2].name,
		expand: false
	}),
])
pvt.rows = ko.observableArray([
	app.koMap({
		field: pvt.optionRows()[3].field,
		name: pvt.optionRows()[3].name,
		expand: false
	}),
])
pvt.dataPoints = ko.observableArray([
	app.koMap({
		field: pvt.optionDataPoints()[0].field,
		name: pvt.optionDataPoints()[0].name,
		expand: false,
		aggr: pvt.optionAggregates()[2].aggr
	}),
	// app.koMap({
	// 	field: pvt.optionDataPoints()[0].field,
	// 	name: pvt.optionDataPoints()[0].name,
	// 	expand: false,
	// 	aggr: pvt.optionAggregates()[2].aggr
	// }),
])
pvt.data = ko.observableArray([/*tempData*/])
pvt.currentTargetDimension = null

pvt.prepareTooltipster = () => {
	let config = {
		contentAsHTML: true,
		interactive: true,
		theme: 'tooltipster-whi',
		animation: 'grow',
		delay: 0,
		offsetY: -5,
		touchDevices: false,
		trigger: 'click',
		position: 'top'
	}
	
	$('.tooltipster-dimension').each((i, e) => {
		$(e).tooltipster($.extend(true, config, {
			content: $(`
				<h3 class="no-margin no-padding">Add to</h3>
				<div>
					<button class='btn btn-sm btn-success' data-target-module='column' onmouseenter='pvt.hoverInModule(this);' onmouseleave='pvt.hoverOutModule(this);' onclick='pvt.addAs(this, "column")'>
						<i class='fa fa-columns'></i> Column
					</button>
					<button class='btn btn-sm btn-success' data-target-module='row' onmouseenter='pvt.hoverInModule(this);' onmouseleave='pvt.hoverOutModule(this);' onclick='pvt.addAs(this, "row")'>
						<i class='fa fa-reorder'></i> Row
					</button>
				</div>
			`)
		}))
	})
	
	$('.tooltipster-column-row').each((i, e) => {
		let title = $(e).closest('.pivot-section').parent().prev().text()
		$(e).tooltipster($.extend(true, config, {
			content: $(`
				<h3 class="no-margin no-padding">${title} setting</h3>
				<div>
					<button class='btn btn-sm btn-success' onmouseenter='pvt.hoverInModule(this);' onmouseleave='pvt.hoverOutModule(this);' onclick='pvt.configure(this, "column")'>
						<i class='fa fa-gear'></i> Configure
					</button>
					<button class='btn btn-sm btn-success' onmouseenter='pvt.hoverInModule(this);' onmouseleave='pvt.hoverOutModule(this);' onclick='pvt.removeFrom()'>
						<i class='fa fa-trash'></i> Remove
					</button>
				</div>
			`)
		}))
	})
}
pvt.showConfig = () => {
	vm.hideFilter()
	rpt.mode('')
	pvt.refreshData()
}
pvt.showFieldControl = (o) => {
	pvt.currentTargetDimension = $(o).prev()
}
pvt.hoverInModule = (o) => {
	let target = $(o).attr('data-target-module')
	$(`[data-module="${target}"]`).addClass('highlight')
}
pvt.hoverOutModule = (o) => {
	let target = $(o).attr('data-target-module')
	$(`[data-module="${target}"]`).removeClass('highlight')
}
pvt.getData = (callback) => {
	app.ajaxPost("/report/getdatapivot", {}, (res) => {
		if (!app.isUndefined(callback)) {
			callback(res)
		}
	})
}
pvt.addColumn = () => {
	let row = ko.mapping.fromJS(app.clone(pvt.templateRowColumn))
	pvt.dimensions.push(row)
	app.prepareTooltipster($(".pivot-section-columns .input-group:last .tooltipster"))
}
pvt.addRow = () => {
	let row = ko.mapping.fromJS(app.clone(pvt.templateDataPoint))
	pvt.rows.push(row)
	app.prepareTooltipster($(".pivot-section-row .input-group:last .tooltipster"))
}
pvt.addDataPoint = () => {
	let row = ko.mapping.fromJS(app.clone(pvt.templateDataPoint))
	pvt.dataPoints.push(row)
	app.prepareTooltipster($(".pivot-section-data-point .input-group:last .tooltipster"))
}
pvt.addAs = (o, what) => {
	let holder = pvt[`${what}s`]
	let id = $(pvt.currentTargetDimension).attr('data-id')

	let isAddedOnColumn = (typeof ko.mapping.toJS(pvt.dimensions()).find((d) => d.field === id) !== 'undefined')
	let isAddedOnRow    = (typeof ko.mapping.toJS(pvt.rows   ()).find((d) => d.field === id) !== 'undefined')

	if (!(isAddedOnColumn || isAddedOnRow)) {
		let row = pvt.optionDimensions().find((d) => d.field === id)
		holder.push(ko.mapping.fromJS({ field: row.field, name: row.name, expand: false }))
	}
}
pvt.removeFrom = (o, which) => {
	swal({
		title: "Are you sure?",
		text: 'Item will be deleted',
		type: "warning",
		showCancelButton: true,
		confirmButtonColor: "#DD6B55",
		confirmButtonText: "Delete",
		closeOnConfirm: true
	}, () => {
		let holder = pvt[which]

		if (which == 'dataPoints') {
			let index = $(o).attr('data-index')
			app.arrRemoveByIndex(holder, index)
		}

		let id = $(o).attr('data-id')
		let row = holder().find((d) => ko.mapping.toJS(d).field == id)
		app.arrRemoveByItem(holder, row)
	})
}
pvt.showAndRefreshPivot = () => {
	// vm.showFilter()
	rpt.mode('render')
	pvt.refreshData()
}
pvt.refreshData = () => {
	let dimensions = ko.mapping.toJS(pvt.dimensions).map((d) => { return { type: 'column', field: d.field, alias: d.name } })
		     .concat(ko.mapping.toJS(pvt.rows)   .map((d) => { return { type: 'row'   , field: d.field, alias: d.name } }))

	let dataPoints = ko.mapping.toJS(pvt.dataPoints)
		.filter((d) => d.field != '' && d.aggr != '')
		.map((d) => { 
			let row = ko.mapping.toJS(pvt.pivotModel).find((e) => e.field == d.field)
			let name = (row == undefined) ? d.field : row.name
			return { op: d.aggr, field: d.field, alias: name }
		})

	let param = { dimensions: dimensions, datapoints: dataPoints }
	app.ajaxPost("/report/summarycalculatedatapivot", param, (res) => {
		if (!app.isFine(res)) {
			return
		}

		if (res.data.length == 0) {
			return
		}

	    let config = {
	        filterable: false,
	        reorderable: false,
	        dataSource: {
				data: res.data.data,
				schema: {
					model: {
						fields: res.data.metadata.SchemaModelFields
					},
					cube: {
						dimensions: res.data.metadata.SchemaCubeDimension,
						measures: res.data.metadata.SchemaCubeMeasures
					}
				},
				columns: res.data.metadata.Columns,
				rows: res.data.metadata.Rows,
				measures: res.data.metadata.Measures
			}
	    }

		app.log(config)

		$('.pivot').replaceWith('<div class="pivot"></div>')
		$('.pivot').kendoPivotGrid(config)
	})
}

pvt.init = () => {
	pvt.prepareTooltipster()
	pvt.refreshData()
}

