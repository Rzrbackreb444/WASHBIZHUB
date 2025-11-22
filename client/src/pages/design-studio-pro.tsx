import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart
} from "recharts";
import { DollarSign, TrendingUp, Calculator, Zap, Save, Download } from "lucide-react";

// Equipment Library with Pricing
const EQUIPMENT_LIBRARY = [
  { id: "washer-24", name: "24lb Washer (New)", price: 2800, tpd: 2.5, category: "Washers", color: "#3b82f6" },
  { id: "washer-30", name: "30lb Washer (New)", price: 3200, tpd: 3.0, category: "Washers", color: "#3b82f6" },
  { id: "washer-40", name: "40lb Washer (New)", price: 4200, tpd: 3.8, category: "Washers", color: "#3b82f6" },
  { id: "dryer-60", name: "60lb Dryer (New)", price: 3500, tpd: 2.8, category: "Dryers", color: "#ef4444" },
  { id: "dryer-75", name: "75lb Dryer (New)", price: 4200, tpd: 3.2, category: "Dryers", color: "#ef4444" },
  { id: "folding-table", name: "Folding Table", price: 400, tpd: 0, category: "Utility", color: "#8b5cf6" },
  { id: "change-machine", name: "Change Machine", price: 1200, tpd: 0, category: "Payment", color: "#10b981" },
  { id: "card-reader", name: "Card Reader System", price: 1500, tpd: 0, category: "Payment", color: "#10b981" },
];

interface PlacedEquipment {
  id: string;
  equipment: typeof EQUIPMENT_LIBRARY[number];
  quantity: number;
}

interface PricingMetrics {
  totalEquipmentCost: number;
  totalTPD: number;
  avgPricePerLb: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  roiMonths: number;
  paybackPeriod: number;
  monthlyExpenses: number;
}

export default function DesignStudioPro() {
  const [equipment, setEquipment] = useState<PlacedEquipment[]>([]);
  const [roomSize, setRoomSize] = useState(3000);
  const [pricePerLb, setPricePerLb] = useState(1.75);
  const [monthlyExpenses, setMonthlyExpenses] = useState(2500);
  const [utilizationRate, setUtilizationRate] = useState(65);

  // Calculate metrics
  const metrics: PricingMetrics = useMemo(() => {
    const totalEquipmentCost = equipment.reduce((sum, item) => sum + item.equipment.price * item.quantity, 0);
    const totalTPD = equipment.reduce((sum, item) => sum + item.equipment.tpd * item.quantity, 0);
    
    // Assume average load per machine is 15 lbs
    const dailyPounds = totalTPD * 15 * (utilizationRate / 100);
    const monthlyRevenue = dailyPounds * 30 * pricePerLb;
    const monthlyProfit = monthlyRevenue - monthlyExpenses;
    const roiMonths = totalEquipmentCost > 0 ? Math.ceil(totalEquipmentCost / monthlyProfit) : 0;

    return {
      totalEquipmentCost,
      totalTPD,
      avgPricePerLb: pricePerLb,
      monthlyRevenue,
      monthlyProfit,
      roiMonths: roiMonths > 0 ? roiMonths : 0,
      paybackPeriod: roiMonths,
      monthlyExpenses,
    };
  }, [equipment, pricePerLb, monthlyExpenses, utilizationRate]);

  // Cost breakdown data
  const costBreakdown = useMemo(() => {
    return equipment.map(item => ({
      name: item.equipment.name,
      value: item.equipment.price * item.quantity,
      equipment: item.equipment.name,
      quantity: item.quantity,
    }));
  }, [equipment]);

  // Revenue projection (12 months)
  const revenueProjection = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: metrics.monthlyRevenue * (i + 1),
      expenses: metrics.monthlyExpenses * (i + 1),
      profit: (metrics.monthlyRevenue - metrics.monthlyExpenses) * (i + 1),
    }));
  }, [metrics.monthlyRevenue, metrics.monthlyExpenses]);

  const addEquipment = (equip: typeof EQUIPMENT_LIBRARY[number]) => {
    const existing = equipment.find(e => e.equipment.id === equip.id);
    if (existing) {
      setEquipment(equipment.map(e => e.equipment.id === equip.id ? { ...e, quantity: e.quantity + 1 } : e));
    } else {
      setEquipment([...equipment, { id: equip.id, equipment: equip, quantity: 1 }]);
    }
  };

  const removeEquipment = (id: string) => {
    setEquipment(equipment.filter(e => e.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeEquipment(id);
    } else {
      setEquipment(equipment.map(e => e.id === id ? { ...e, quantity } : e));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-5xl font-bold flex items-center justify-center gap-3">
            <Calculator className="w-12 h-12 text-accent" />
            Design Studio Pro
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time pricing optimizer with ROI calculations and revenue projections
          </p>
        </div>

        <Tabs defaultValue="design" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="design">Equipment Selection</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Metrics</TabsTrigger>
            <TabsTrigger value="projection">ROI Projection</TabsTrigger>
          </TabsList>

          {/* Equipment Selection Tab */}
          <TabsContent value="design" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Equipment Library */}
              <Card className="lg:col-span-1 h-fit">
                <CardHeader>
                  <CardTitle className="text-lg">Equipment Library</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {["Washers", "Dryers", "Payment", "Utility"].map(category => (
                    <div key={category}>
                      <h4 className="font-semibold text-sm mb-2">{category}</h4>
                      <div className="space-y-2">
                        {EQUIPMENT_LIBRARY.filter(e => e.category === category).map(equip => (
                          <Button
                            key={equip.id}
                            variant="outline"
                            size="sm"
                            onClick={() => addEquipment(equip)}
                            className="w-full justify-between text-xs h-auto py-2"
                            data-testid={`button-add-equipment-${equip.id}`}
                          >
                            <span>{equip.name}</span>
                            <span className="text-accent font-bold">${equip.price}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Selected Equipment */}
              <div className="lg:col-span-3 space-y-4">
                {/* Room Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Room Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Room Size (sq ft)</Label>
                      <Input
                        type="number"
                        value={roomSize}
                        onChange={(e) => setRoomSize(Number(e.target.value))}
                        className="mt-1"
                        data-testid="input-room-size"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Price per Pound</Label>
                      <Input
                        type="number"
                        step="0.05"
                        value={pricePerLb}
                        onChange={(e) => setPricePerLb(Number(e.target.value))}
                        className="mt-1"
                        data-testid="input-price-per-lb"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Utilization Rate (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={utilizationRate}
                        onChange={(e) => setUtilizationRate(Number(e.target.value))}
                        className="mt-1"
                        data-testid="input-utilization"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Equipment List */}
                {equipment.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Selected Equipment ({equipment.length} types)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {equipment.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                            data-testid={`equipment-row-${item.id}`}
                          >
                            <div>
                              <p className="font-semibold text-sm">{item.equipment.name}</p>
                              <p className="text-xs text-muted-foreground">
                                ${item.equipment.price.toLocaleString()} × {item.quantity} = ${(item.equipment.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                                className="w-16 h-8"
                                data-testid={`input-quantity-${item.id}`}
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeEquipment(item.id)}
                                data-testid={`button-remove-${item.id}`}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      Select equipment from the library to get started
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Pricing & Metrics Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Metrics */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Investment Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-muted-foreground text-sm">Total Equipment Cost</p>
                      <p className="text-3xl font-bold text-accent" data-testid="metric-total-cost">
                        ${metrics.totalEquipmentCost.toLocaleString()}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground text-sm">Total TPD</p>
                        <p className="text-2xl font-bold" data-testid="metric-tpd">
                          {metrics.totalTPD.toFixed(1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Cost per TPD</p>
                        <p className="text-2xl font-bold">
                          ${metrics.totalTPD > 0 ? (metrics.totalEquipmentCost / metrics.totalTPD).toLocaleString() : 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-muted-foreground text-sm">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-green-500" data-testid="metric-monthly-revenue">
                        ${metrics.monthlyRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Monthly Expenses</p>
                      <p className="text-xl font-semibold" data-testid="metric-monthly-expenses">
                        ${metrics.monthlyExpenses.toLocaleString()}
                      </p>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-muted-foreground text-sm">Monthly Profit</p>
                      <p className={`text-2xl font-bold ${metrics.monthlyProfit > 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="metric-monthly-profit">
                        ${metrics.monthlyProfit.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="space-y-4">
                {/* Cost Breakdown */}
                {costBreakdown.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Equipment Cost Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={costBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {costBreakdown.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={["#3b82f6", "#ef4444", "#10b981", "#f59e0b"][index % 4]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* ROI Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    Payback Period
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-accent" data-testid="metric-payback-period">
                    {metrics.roiMonths}
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">months</p>
                </CardContent>
              </Card>

              <Card className="border-green-500/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Annual Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-green-500" data-testid="metric-annual-profit">
                    ${(metrics.monthlyProfit * 12).toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">projected</p>
                </CardContent>
              </Card>

              <Card className="border-accent/50">
                <CardHeader>
                  <CardTitle className="text-lg">Investment Multiple</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-accent">
                    {metrics.monthlyProfit > 0 ? (12 / metrics.roiMonths).toFixed(1) : "—"}x
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">per year</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ROI Projection Tab */}
          <TabsContent value="projection" className="space-y-6">
            {revenueProjection.length > 0 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">12-Month Revenue Projection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={revenueProjection} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" label={{ value: "Month", position: "insideBottomRight", offset: -5 }} />
                        <YAxis label={{ value: "Amount ($)", angle: -90, position: "insideLeft" }} />
                        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                        <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                        <Line type="monotone" dataKey="profit" stroke="#3b82f6" name="Profit" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">12-Month Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-muted-foreground text-sm">Total 12-Month Revenue</p>
                        <p className="text-2xl font-bold text-green-500">
                          ${(metrics.monthlyRevenue * 12).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Total 12-Month Expenses</p>
                        <p className="text-2xl font-bold text-red-500">
                          ${(metrics.monthlyExpenses * 12).toLocaleString()}
                        </p>
                      </div>
                      <div className="pt-3 border-t">
                        <p className="text-muted-foreground text-sm">Total 12-Month Profit</p>
                        <p className="text-2xl font-bold text-blue-500">
                          ${((metrics.monthlyRevenue - metrics.monthlyExpenses) * 12).toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Key Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Badge className="mt-1">✓</Badge>
                        <span>Equipment pays for itself in <strong>{metrics.roiMonths} months</strong></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge className="mt-1">✓</Badge>
                        <span>Year 1 net profit: <strong>${((metrics.monthlyRevenue - metrics.monthlyExpenses) * 12).toLocaleString()}</strong></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge className="mt-1">✓</Badge>
                        <span>Equipment utilization: <strong>{utilizationRate}%</strong></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge className="mt-1">✓</Badge>
                        <span>Pricing: <strong>${pricePerLb}/lb</strong> = excellent positioning</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Export & Save */}
        <div className="flex gap-3 justify-center">
          <Button size="lg" className="gap-2" data-testid="button-save-design">
            <Save className="w-5 h-5" />
            Save Design
          </Button>
          <Button size="lg" variant="outline" className="gap-2" data-testid="button-export-pdf">
            <Download className="w-5 h-5" />
            Export PDF Report
          </Button>
        </div>
      </div>
    </div>
  );
}
