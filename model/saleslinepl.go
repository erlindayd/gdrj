package gdrj

import (
	"strings"

	"github.com/eaciit/dbox"
	"github.com/eaciit/orm/v1"
	"github.com/eaciit/toolkit"
)

type PLData struct {
	PLCode                 string
	PLOrder                string
	Group1, Group2, Group3 string
	Amount                 float64
}

type SalesPL struct {
	orm.ModelBase `bson:"-" json:"-"`
	ID            string `bson:"_id" json:"_id"`

	SKUID       string
	SKUID_VDIST string
	OutletID    string

	SalesQty       float64
	GrossAmount    float64
	DiscountAmount float64
	TaxAmount      float64
	NetAmount      float64

	Date     *Date
	Customer *Customer
	Product  *Product
	PC       *ProfitCenter
	CC       *CostCenter

	RatioToGlobalSales float64
	RatioToBranchSales float64
	RatioToBrandSales  float64
	RatioToSKUSales    float64

	PLDatas map[string]*PLData
}

func (s *SalesPL) TableName() string {
	return "salespls"
}

func (s *SalesPL) RecordID() interface{} {
	s.ID = s.PrepareID().(string)
	return s.ID
}

func TrxToSalesPL(conn dbox.IConnection,
	trx *SalesTrx,
	masters toolkit.M,
	config toolkit.M) *SalesPL {

	pl := new(SalesPL)
	pl.ID = trx.ID
	pl.SKUID = trx.SKUID
	pl.SKUID_VDIST = trx.SKUID_VDIST
	pl.OutletID = trx.OutletID

	pl.Date = SetDate(trx.Date)

	pl.SalesQty = trx.SalesQty
	pl.GrossAmount = trx.GrossAmount
	pl.DiscountAmount = trx.DiscountAmount
	pl.TaxAmount = trx.TaxAmount
	pl.NetAmount = pl.GrossAmount - pl.DiscountAmount

	pl.Customer = trx.Customer
	pl.Product = trx.Product

	//-- classing
	if pl.Customer == nil {
		c := new(Customer)
		c.BranchID = "CD02"
		c.CustType = "General"
		c.IsRD = false
		pl.Customer = c
	}

	if pl.Customer.ChannelID == "I1" {
		pl.Customer.IsRD = true
		pl.Customer.ReportChannel = "RD"
		pl.Customer.ChannelName = "MT"
	} else if pl.Customer.ChannelID == "I3" {
		pl.Customer.IsRD = false
		pl.Customer.ReportChannel = "MT"
		pl.Customer.ChannelName = "MT"
	} else if pl.Customer.ChannelID == "I4" {
		pl.Customer.IsRD = false
		pl.Customer.ReportChannel = "IT"
		pl.Customer.ChannelName = "IT"
	} else {
		pl.Customer.IsRD = false
		pl.Customer.ReportChannel = "GT"
		pl.Customer.ChannelName = "GT"
	}

	if pl.Product == nil {
		p := new(Product)
		p.Brand = "Other"
		p.Name = "Other"
	}
	//-- end of classing

	compute := strings.ToLower(config.Get("compute", "all").(string))
	if compute != "none" {
		globalSales := masters.Get("globalsales").(float64)
		branchSales := masters.Get("branchsales").(map[string]float64)
		brandSales := masters.Get("brandsales").(map[string]float64)

		var brandSale, branchSale float64
		if pl.Product != nil {
			brandSale, _ = brandSales[pl.Product.Brand]
		}

		if pl.Customer != nil {
			branchSale, _ = branchSales[pl.Customer.BranchID]
		}

		if globalSales != 0 {
			pl.RatioToGlobalSales = pl.NetAmount / globalSales
		}

		if brandSale != 0 {
			pl.RatioToBrandSales = pl.NetAmount / brandSale
		}

		if branchSale != 0 {
			pl.RatioToBranchSales = pl.NetAmount / branchSale
		}

		if compute == "all" {
			pl.CalcSales(masters)
			pl.CalcCOGS(masters)
			pl.CalcRoyalties(masters)
			pl.CalcFreight(masters)
			pl.CalcPromo(masters)
			pl.CalcSGA(masters)
		} else if compute == "sales" {
			pl.CalcSales(masters)
		} else if compute == "cogs" {
			pl.CalcCOGS(masters)
		} else if compute == "freight" {
			pl.CalcFreight(masters)
		} else if compute == "promo" {
			pl.CalcRoyalties(masters)
			pl.CalcPromo(masters)
		} else if compute == "sga" {
			pl.CalcSGA(masters)
		} else if compute == "rawdatapl" {
			pl.CalcFreight(masters)
			pl.CalcRoyalties(masters)
			pl.CalcPromo(masters)
			pl.CalcSGA(masters)
		}
	}
	pl.CalcSum(masters)

	return pl
}

func (pl *SalesPL) CalcSum(masters toolkit.M) {
	var netsales, cogs, grossmargin, sellingexpense,
		sga, opincome float64

	plmodels := masters.Get("plmodel").(map[string]*PLModel)
	for _, v := range pl.PLDatas {
		if v.Group1 == "Net Sales" {
			netsales += v.Amount
			opincome += v.Amount
			grossmargin += v.Amount
		} else if v.Group1 == "Direct Expense" || v.Group1 == "Indirect Expense" {
			cogs += v.Amount
			opincome += v.Amount
			grossmargin += v.Amount
		} else if v.Group1 == "Freight Expense" || v.Group1 == "Royalties & Trademark Exp" ||
			v.Group1 == "Advt & Promo Expenses" {
			sellingexpense += v.Amount
			opincome += v.Amount
		} else if v.Group1 == "G&A Expenses" {
			sga += v.Amount
			opincome += v.Amount
		}
	}

	pl.AddData("PL8A", netsales, plmodels)
	pl.AddData("PL74B", cogs, plmodels)
	pl.AddData("PL74C", grossmargin, plmodels)
	pl.AddData("PL32B", sellingexpense, plmodels)
	pl.AddData("PL94A", sga, plmodels)
	pl.AddData("PL94C", opincome, plmodels)
}

func (pl *SalesPL) CalcSales(masters toolkit.M) {
	plmodels := masters.Get("plmodel").(map[string]*PLModel)
	if pl.Customer.IsRD {
		pl.AddData("PL2", pl.GrossAmount, plmodels)
		pl.AddData("PL8", pl.DiscountAmount, plmodels)
		//pl.AddData("PL8A", pl.GrossAmount, plmodels)
	} else {
		pl.AddData("PL1", pl.GrossAmount, plmodels)
		pl.AddData("PL7", pl.DiscountAmount, plmodels)
		//pl.AddData("PL8A", pl.GrossAmount, plmodels)
	}
}

func (pl *SalesPL) CalcCOGS(masters toolkit.M) {
	//-- cogs
	cogsid := toolkit.Sprintf("%d_%d_%s", pl.Date.Year, pl.Date.Month, pl.SKUID)
	if pl.Date.Year == 2014 && pl.Date.Month <= 9 {
		cogsid = toolkit.Sprintf("%d_%d_%s", 2014, 9, pl.SKUID)
	}
	if !masters.Has("cogs") {
		return
	}
	cogsTable := masters.Get("cogs").(map[string]*COGSConsolidate)
	cogsSchema, exist := cogsTable[cogsid]
	if !exist {
		toolkit.Printfn("COGS error: no keys for ID %s", cogsid)
        return
	}

    cogsAmount := float64(0)
    cogsShemaAmount := float64(0)
	if cogsSchema.COGS_Amount == 0 {
		cogsShemaAmount = cogsSchema.RM_Amount + 
            cogsSchema.LC_Amount + 
            cogsSchema.PF_Amount +
            cogsSchema.Depre_Amount +
            cogsSchema.Other_Amount
	} else {
        cogsShemaAmount = cogsSchema.COGS_Amount
    }

    if cogsShemaAmount==0 {
        toolkit.Printfn("COGS error: no keys for ID %s", cogsid)
        return
    }

	if cogsSchema.NPS_Amount != 0 {
		cogsAmount = -cogsShemaAmount * pl.NetAmount / cogsSchema.NPS_Amount
	}

	rmAmount := cogsSchema.RM_Amount * cogsAmount / cogsShemaAmount
	lcAmount := cogsSchema.LC_Amount * cogsAmount / cogsShemaAmount
	energyAmount := cogsSchema.PF_Amount * cogsAmount / cogsShemaAmount
	depreciation := cogsSchema.Depre_Amount * cogsAmount / cogsShemaAmount
	otherAmount := cogsAmount - rmAmount - lcAmount - energyAmount - depreciation

	plmodels := masters.Get("plmodel").(map[string]*PLModel)
	pl.AddData("PL9", rmAmount, plmodels)
	pl.AddData("PL14", lcAmount, plmodels)
	pl.AddData("PL74", energyAmount, plmodels)
	pl.AddData("Pl20", otherAmount, plmodels)
	pl.AddData("PL21", energyAmount, plmodels)
	//pl.AddData("PL74B", cogsAmount, plmodels)
}

func (pl *SalesPL) CalcFreight(masters toolkit.M) {
	if masters.Has("freight") == false {
		return
	}
	freights := masters.Get("freight").(map[string]*RawDataPL)

	freightid := toolkit.Sprintf("%d_%d_%s", pl.Date.Year, pl.Date.Month, pl.Customer.BranchID)
	f, exist := freights[freightid]
	if !exist {
		toolkit.Printfn("Freight error: key is not exist %s", freightid)
		return
	}

	plmodels := masters.Get("plmodel").(map[string]*PLModel)
	pl.AddData("PL23", -f.AmountinIDR*pl.RatioToBranchSales, plmodels)
}

func (pl *SalesPL) CalcRoyalties(masters toolkit.M) {
	if masters.Has("royalties") == false {
		return
	}
	royals := masters.Get("royalties").(map[string]*RawDataPL)

	royalid := toolkit.Sprintf("%d_%d", pl.Date.Year, pl.Date.Month)
	r, exist := royals[royalid]
	if !exist {
        toolkit.Printfn("Royalty error: key is not exist %s", royalid)
		return
	}

	plmodels := masters.Get("plmodel").(map[string]*PLModel)
	pl.AddData("PL26A", -r.AmountinIDR*pl.RatioToGlobalSales, plmodels)
}

func (pl *SalesPL) CalcPromo(masters toolkit.M) {
	if masters.Has("promo") == false {
		return
	}
	promos := masters.Get("promo").(map[string]*RawDataPL)

	find := func(x string) *RawDataPL {
		freightid := toolkit.Sprintf("%d_%d_%s", pl.Date.Year, pl.Date.Month, x)
		f, exist := promos[freightid]
		if !exist {
			return &RawDataPL{}
		}
		return f
	}

	fAtl := find("atl")
	fBtlBonus := find("bonus")
	fBtlGondola := find("gondola")
	fBtlSPG := find("spg")
	fBtlOtherpromo := find("promo")

	plmodels := masters.Get("plmodel").(map[string]*PLModel)
	pl.AddData("PL28", -fAtl.AmountinIDR*pl.RatioToBranchSales, plmodels)
	pl.AddData("PL29", -fBtlBonus.AmountinIDR*pl.RatioToBranchSales, plmodels)
	pl.AddData("PL30", -fBtlGondola.AmountinIDR*pl.RatioToBranchSales, plmodels)
	pl.AddData("PL31", -fBtlOtherpromo.AmountinIDR*pl.RatioToBranchSales, plmodels)
	pl.AddData("PL32", -fBtlSPG.AmountinIDR*pl.RatioToBranchSales, plmodels)
}

func (pl *SalesPL) CalcSGA(masters toolkit.M) {
	if masters.Has("sga") == false || masters.Has("ledger") == false {
		return
	}
	sgas := masters.Get("sga").(map[string]map[string]*RawDataPL)

	plmodels := masters.Get("plmodel").(map[string]*PLModel)
	sgaid := toolkit.Sprintf("%d_%d", pl.Date.Year, pl.Date.Month)
	raws, exist := sgas[sgaid]
	if !exist {
        toolkit.Printfn("SGA Error: Can't find key %s", sgaid)
		return
	}

	ccs := map[string]*CostCenter{}
	if masters.Has("cc") {
		ccs = masters.Get("cc").(map[string]*CostCenter)
	}
	ledgers := masters.Get("ledger").(map[string]*LedgerMaster)
	for _, raw := range raws {
		plcode := "PL34"
		ledger, exist := ledgers[raw.Account]
		if exist {
			plcode = ledger.PLCode
		}
		cc, exist := ccs[raw.CCID]
		ccgroup := "Other"
		if exist {
			ccgroup = cc.CostGroup01
		}
		pl.AddDataCC(plcode, -pl.RatioToGlobalSales*raw.AmountinIDR, ccgroup, plmodels)
	}
}

func (pl *SalesPL) AddData(plcode string, amount float64, models map[string]*PLModel) {
	pl.AddDataCC(plcode, amount, "", models)
}

func (pl *SalesPL) AddDataCC(plcode string, amount float64, ccgroup string, models map[string]*PLModel) {
	if amount == 0 {
		return
	}
	m, exist := models[plcode]
	if !exist {
		return
	}
	pl_m, exist := pl.PLDatas[plcode]
	if !exist {
		pl_m = new(PLData)
		pl_m.PLOrder = m.OrderIndex
		pl_m.Group1 = m.PLHeader1
		pl_m.Group2 = m.PLHeader2
		pl_m.Group3 = m.PLHeader3
	}
	if ccgroup != "" {
		pl_m.Group3 = ccgroup
	}
	pl_m.Amount += amount
	if pl.PLDatas == nil {
		pl.PLDatas = map[string]*PLData{}
	}
	if ccgroup != "" {
		plcode = plcode + "_" + ccgroup
	}
	pl.PLDatas[plcode] = pl_m
}
