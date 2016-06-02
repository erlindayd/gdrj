// let menuLink = vm.menu()
// 	.find((d) => d.href == ('/' + document.URL.split('/').slice(3).join('/')))

// vm.currentMenu(menuLink.title)
// vm.currentTitle(menuLink.title)
// vm.breadcrumb([
// 	{ title: 'Godrej', href: '#' },
// 	{ title: menuLink.title, href: menuLink.href }
// ])

let menuLink = vm.menu()
    .find((d) => d.title == "Report").submenu
	.find((d) => d.href == ('/' + document.URL.split('/').slice(3).join('/')))

vm.currentMenu('Report')
vm.currentTitle(menuLink.title)
vm.breadcrumb([
	{ title: 'Godrej', href: '#' },
	{ title: menuLink.title, href: menuLink.href }
])

viewModel.report = new Object()
let rpt = viewModel.report

rpt.filter = [
	{ _id: 'common', group: 'Base Filter', sub: [
		{ _id: 'Branch', from: 'Branch', title: 'Branch' },
		{ _id: 'Brand', from: 'Brand', title: 'Brand' },
		{ _id: 'RegionC', from: 'Region', title: 'Region' },
		{ _id: 'Channel', from: 'Channel', title: 'Channel' },
		{ _id: 'From', from: 'From' },
		{ _id: 'To', from: 'To' },
	] },
	{ _id: 'geo', group: 'Geographical', sub: [
		{ _id: 'Zone', from: 'Zone', title: 'Zone' },
		{ _id: 'Region', from: 'Region', title: 'Region' },
		{ _id: 'Area', from: 'Area', title: 'Area' }
	] },
	{ _id: 'customer', group: 'Customer', sub: [
		{ _id: 'ChannelC', from: 'Channel', title: 'Channel' },
		{ _id: 'KeyAccount', from: 'KeyAccount', title: 'Accounts' },
		{ _id: 'Customer', from: 'Customer', title: 'Outlet' }
	] },
	{ _id: 'product', group: 'Product', sub: [
		{ _id: 'HBrandCategory', from: 'HBrandCategory', title: 'Group' },
		{ _id: 'BrandP', from: 'Brand', title: 'Brand' },
		{ _id: 'Product', from: 'Product', title: 'SKU' }
	] },
	{ _id: 'profit_center', group: 'Profit Center', sub: [
		{ _id: 'Entity', from: 'Entity', title: 'Entity' },
		{ _id: 'Type', from: 'Type', title: 'Type' },
		{ _id: 'BranchPC', from: 'Branch', title: 'Branch' },
		{ _id: 'HQ', from: 'HQ', title: 'HQ' }
	] },
	{ _id: 'cost_center', group: 'Cost Center', sub: [
		{ _id: 'Group1', from: 'Group1', title: 'Group 1' },
		{ _id: 'Group2', from: 'Group2', title: 'Group 2' },
		{ _id: 'HCostCenterGroup', from: 'HCostCenterGroup', title: 'Function' }
	] },
	{ _id: 'ledger', group: 'Ledger', sub: [
		{ _id: 'LedgerAccount', from: 'LedgerAccount', title: 'GL Code' }
	] },
]

rpt.valueMasterData = {}
rpt.masterData = {
	geographi: ko.observableArray([])
}
rpt.enableHolder = {}
rpt.eventChange = {}
rpt.masterData.Type = ko.observableArray([
	{ value: 'Mfg', text: 'Mfg' },
	{ value: 'Branch', text: 'Branch' }
])
rpt.masterData.HQ = ko.observableArray([
	{ value: true, text: 'True' },
	{ value: false, text: 'False' }
])
rpt.filter.forEach((d) => {
	d.sub.forEach((e) => {
		if (rpt.masterData.hasOwnProperty(e._id)) {
			return
		}

		rpt.valueMasterData[e._id] = ko.observableArray([])
		rpt.masterData[e._id] = ko.observableArray([])
		rpt.enableHolder[e._id] = ko.observable(true)
		rpt.eventChange[e._id] = function () {
			let self = this
			let value = self.value()

			setTimeout(() => {
				let vZone = rpt.valueMasterData['Zone']()
				let vRegion = rpt.valueMasterData['Region']()
				let vArea = rpt.valueMasterData['Area']()

				if (e._id == 'Zone') {
					let raw = Lazy(rpt.masterData.geographi())
						.filter((f) => (vZone.length == 0) ? true : (vZone.indexOf(f.Zone) > -1))
						.toArray()

					rpt.masterData.Region(rpt.groupGeoBy(raw, 'Region'))
					rpt.masterData.Area(rpt.groupGeoBy(raw, 'Area'))
				} else if (e._id == 'Region') {
					let raw = Lazy(rpt.masterData.geographi())
						.filter((f) => (vZone.length == 0) ? true : (vZone.indexOf(f.Zone) > -1))
						.filter((f) => (vRegion.length == 0) ? true : (vRegion.indexOf(f.Region) > -1))
						.toArray()

					rpt.masterData.Area(rpt.groupGeoBy(raw, 'Area'))
					rpt.enableHolder['Zone'](vRegion.length == 0)
				} else if (e._id == 'Area') {
					let raw = Lazy(rpt.masterData.geographi())
						.filter((f) => (vZone.length == 0) ? true : (vZone.indexOf(f.Zone) > -1))
						.filter((f) => (vRegion.length == 0) ? true : (vRegion.indexOf(f.Region) > -1))
						.toArray()

					rpt.enableHolder['Region'](vArea.length == 0)
					rpt.enableHolder['Zone'](vRegion.length == 0)
				}

				// change value event goes here
				app.log(e._id, value)
			}, 100)
		}
	})
})

rpt.groupGeoBy = (raw, category) => {
	let groupKey = (category == 'Area') ? '_id' : category
	let data = Lazy(raw)
		.groupBy((f) => f[groupKey])
		.map((k, v) => { return { _id: v, Name: app.capitalize(v, true) } })
		.toArray()

	return data
}

rpt.filterMultiSelect = (d) => {
	let config = {
		filter: 'contains',
		placeholder: 'Choose items ...',
		change: rpt.eventChange[d._id],
		value: rpt.valueMasterData[d._id]
	}

	if (['HQ', 'Type'].indexOf(d.from) > -1) {
		config = $.extend(true, config, {
			data: rpt.masterData[d._id],
			dataValueField: 'value',
			dataTextField: 'text'
		})
	} else if (['Customer'].indexOf(d.from) > -1) {
		config = $.extend(true, config, {
			autoBind: false,
			minLength: 1,
			placeholder: 'Type min 1 chars',
			dataValueField: '_id',
			dataTextField: 'Name',
			template: (d) => `${d._id} - ${d.Name}`,
			enabled: rpt.enableHolder[d._id],
			dataSource: {
				serverFiltering: true,
                transport: {
                    read: {
                        url: `/report/getdata${d.from.toLowerCase()}`,
                    },
                    parameterMap: function(data, type) {
                    	let keyword = data.filter.filters[0].value
						return { keyword: keyword }
					}
                },
                schema: {
					data: 'data'
				}
			}
		})
	} else if (['Branch', 'Brand', 'HCostCenterGroup', 'Entity', 'Channel', 'HBrandCategory', 'Product', 'Type', 'KeyAccount', 'LedgerAccount'].indexOf(d.from) > -1) {
		config = $.extend(true, config, {
			data: rpt.masterData[d._id],
			dataValueField: '_id',
			dataTextField: 'Name',
			enabled: rpt.enableHolder[d._id],
			template: (d) => {
				if (d._id == 'KeyAccount') {
					return app.capitalize(d.KeyAccount, true)
				}

				return `${d._id} - ${app.capitalize(d.Name, true)}`
			}
		})

		if (d.from == 'Product') {
			config = $.extend(true, config, {
				minLength: 1,
				placeholder: 'Type min 1 chars'
			})
		}

		app.ajaxPost(`/report/getdata${d.from.toLowerCase()}`, {}, (res) => {
			if (!res.success) {
				return
			}

			rpt.masterData[d._id](res.data)

			if (d._id == 'Branch') {
				ol.initMap()
			}
		})
	} else if (['Region', 'Area', 'Zone'].indexOf(d.from) > -1) {
		config = $.extend(true, config, {
			data: rpt.masterData[d._id],
			dataValueField: '_id',
			dataTextField: 'Name',
			enabled: rpt.enableHolder[d._id],
		})

		if (d.from == 'Region') {
			app.ajaxPost(`/report/getdatahgeographi`, {}, (res) => {
				if (!res.success) {
					return
				}

				rpt.masterData.geographi(res.data);

				['Region', 'Area', 'Zone'].forEach((e) => {
					let res = rpt.groupGeoBy(rpt.masterData.geographi(), e)
					rpt.masterData[e](res)
				})

				rpt.masterData.RegionC(rpt.masterData.Region())
			})
		}
	} else {
		config.data = rpt.masterData[d._id]().map((f) => {
			if (!f.hasOwnProperty('Name')) {
				return f
			}

			return { _id: f._id, Name: app.capitalize(f.Name, true) }
		})
	}

	return config
}
rpt.titleFor = (data) => {
	return 'asdfasdfasdfa'
}
rpt.prepareDrag = () => {
	$('.pivot-section').sortable({
	    connectWith: '.pivot-section'
	})
}
rpt.refreshData = () => {
	pvt.refreshData()
	ol.mark()
}

$(() => {
	// vm.showFilterCallback = () => {
	// 	$('.panel-content-pivot').removeClass('col-md-12')
	// 	$('.panel-content-pivot').addClass('col-md-6')

	// 	$('.panel-content-map').removeClass('col-md-12')
	// 	$('.panel-content-map').addClass('col-md-6')

	// 	pvt.showAndRefreshPivot()
	// }
	// vm.hideFilterCallback = () => {
	// 	$('.panel-content-pivot').removeClass('col-md-6')
	// 	$('.panel-content-pivot').addClass('col-md-12')

	// 	$('.panel-content-map').removeClass('col-md-6')
	// 	$('.panel-content-map').addClass('col-md-12')
	// }
	vm.expandToggleContent = (a,b) => {
		$('.panel-content-pivot').toggleClass('col-md-12 col-md-6', 500)
		$('.panel-content-map').toggleClass('col-md-12 col-md-6', 500)
		if ($('.panel-content-pivot').hasClass('col-md-12')) {
			$('.panel-content-map').css({top: '513px'})
			$('.panel-content-pivot').animate({top: '513px'}, 500, function(){
				$('.panel-content-map').insertBefore($('.panel-content-pivot'))
			})
			$('.panel-content-map').animate({top: '0px'}, 1000, function(){
				$('.panel-content-pivot').css({top: '0px'})
			})
		} else {
			console.log($('.panel-content-pivot').width())
			$('.panel-content-pivot').css({top: '513px'})
			$('.panel-content-pivot').css({right: ($('.panel-content-pivot').width()/2) + 'px'})
			$('.panel-content-map').animate({left: ($('.panel-content-map').width()/2) + 'px'}, 500, function(){
				$('.panel-content-pivot').animate({top: '0px'}, 500, function(){
					$('.panel-content-pivot').css({right: ''})
					$('.panel-content-pivot').css({left: ''})
					$('.panel-content-map').css({left: ''})
					$('.panel-content-pivot').insertBefore($('.panel-content-map'))
				})
			})
		}
	}

	rpt.prepareDrag()
	pvt.init()
})