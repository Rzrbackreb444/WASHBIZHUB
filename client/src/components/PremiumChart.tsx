import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

// Bloomberg Terminal Color Palette
const BLOOMBERG_COLORS = {
  primary: '#C8A661',
  gold: '#b8860b',
  navy: '#1e3a5f',
  darkNavy: '#1a2332',
  cyan: '#00d4ff',
  green: '#00ff9d',
  red: '#ff4444',
  orange: '#ff9500',
};

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface PremiumChartProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'd3-radial' | 'd3-waterfall' | 'd3-gauge' | 'd3-river';
  title: string;
  data: ChartDataPoint[];
  height?: number;
  animate?: boolean;
  showLegend?: boolean;
  formatValue?: (value: number) => string;
}

export function PremiumChart({
  type,
  title,
  data,
  height = 300,
  animate = true,
  showLegend = true,
  formatValue = (v) => `$${v.toLocaleString()}`,
}: PremiumChartProps) {
  const d3ContainerRef = useRef<SVGSVGElement>(null);

  // Chart.js configuration for standard charts
  const getChartJsConfig = () => {
    const labels = data.map(d => d.label);
    const values = data.map(d => d.value);
    const colors = data.map((d, i) => d.color || Object.values(BLOOMBERG_COLORS)[i % 7]);

    const chartData = {
      labels,
      datasets: [{
        label: title,
        data: values,
        backgroundColor: type === 'bar' || type === 'line' ? 
          colors.map(c => c + '80') : colors,
        borderColor: colors,
        borderWidth: 2,
        tension: 0.4,
      }],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: animate ? {
        duration: 1500,
        easing: 'easeInOutQuart' as const,
      } : false,
      plugins: {
        legend: {
          display: showLegend,
          labels: {
            color: '#ffffff',
            font: { size: 12, family: "'Inter', sans-serif" },
          },
        },
        title: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          titleColor: BLOOMBERG_COLORS.primary,
          bodyColor: '#ffffff',
          borderColor: BLOOMBERG_COLORS.primary,
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (context: any) => {
              return `${context.label}: ${formatValue(context.parsed.y || context.parsed)}`;
            },
          },
        },
      },
      scales: type !== 'pie' && type !== 'doughnut' ? {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#ffffff80',
            callback: (value: string | number) => formatValue(typeof value === 'number' ? value : parseFloat(value)),
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false,
          },
        },
        x: {
          ticks: { color: '#ffffff80' },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false,
          },
        },
      } : undefined,
    };

    return { data: chartData, options };
  };

  // D3.js Radial Gauge Chart
  const renderD3RadialGauge = () => {
    if (!d3ContainerRef.current) return;
    
    const svg = d3.select(d3ContainerRef.current);
    svg.selectAll("*").remove();

    const width = d3ContainerRef.current.clientWidth;
    const radius = Math.min(width, height) / 2 - 20;
    const value = data[0]?.value || 0;
    const maxValue = 100;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Background arc
    const arc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    g.append("path")
      .attr("d", arc as any)
      .attr("fill", "rgba(255, 255, 255, 0.1)");

    // Value arc
    const valueArc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(-Math.PI / 2 + (value / maxValue) * Math.PI);

    const valuePath = g.append("path")
      .attr("fill", BLOOMBERG_COLORS.primary);

    if (animate) {
      valuePath
        .transition()
        .duration(1500)
        .attrTween("d", () => {
          const interpolate = d3.interpolate(0, value);
          return (t: number) => {
            const interpolatedArc = d3.arc()
              .innerRadius(radius * 0.7)
              .outerRadius(radius)
              .startAngle(-Math.PI / 2)
              .endAngle(-Math.PI / 2 + (interpolate(t) / maxValue) * Math.PI);
            return interpolatedArc(null as any) || '';
          };
        });
    } else {
      valuePath.attr("d", valueArc as any);
    }

    // Center text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -10)
      .attr("font-size", "42px")
      .attr("font-weight", "bold")
      .attr("fill", BLOOMBERG_COLORS.primary)
      .text(Math.round(value));

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 20)
      .attr("font-size", "14px")
      .attr("fill", "#ffffff80")
      .text(data[0]?.label || 'Score');
  };

  // D3.js Waterfall Chart
  const renderD3Waterfall = () => {
    if (!d3ContainerRef.current) return;

    const svg = d3.select(d3ContainerRef.current);
    svg.selectAll("*").remove();

    const width = d3ContainerRef.current.clientWidth;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Calculate cumulative values
    let cumulative = 0;
    const waterfallData = data.map((d, i) => {
      const start = cumulative;
      cumulative += d.value;
      return {
        label: d.label,
        start,
        end: cumulative,
        value: d.value,
        isPositive: d.value >= 0,
      };
    });

    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, chartWidth])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(waterfallData, d => d.end) || 0])
      .nice()
      .range([chartHeight, 0]);

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", "#ffffff80")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Y Axis
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => formatValue(d as number)))
      .selectAll("text")
      .attr("fill", "#ffffff80");

    // Bars
    const bars = g.selectAll(".bar")
      .data(waterfallData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.label) || 0)
      .attr("width", x.bandwidth())
      .attr("y", d => y(Math.max(d.start, d.end)))
      .attr("height", 0)
      .attr("fill", d => d.isPositive ? BLOOMBERG_COLORS.green : BLOOMBERG_COLORS.red)
      .attr("opacity", 0.8);

    if (animate) {
      bars.transition()
        .duration(1000)
        .delay((d, i) => i * 100)
        .attr("height", d => Math.abs(y(d.start) - y(d.end)));
    } else {
      bars.attr("height", d => Math.abs(y(d.start) - y(d.end)));
    }

    // Value labels
    g.selectAll(".label")
      .data(waterfallData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => (x(d.label) || 0) + x.bandwidth() / 2)
      .attr("y", d => y(Math.max(d.start, d.end)) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .attr("font-size", "12px")
      .text(d => formatValue(d.value));
  };

  // D3.js Cash Flow River Chart (Stacked Area)
  const renderD3River = () => {
    if (!d3ContainerRef.current) return;

    const svg = d3.select(d3ContainerRef.current);
    svg.selectAll("*").remove();

    const width = d3ContainerRef.current.clientWidth;
    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create time series data (simulated)
    const timePoints = data.length;
    const stackData = data.map((category, categoryIndex) => {
      return Array.from({ length: timePoints }, (_, i) => ({
        x: i,
        y: category.value * (1 + Math.sin(i * 0.5) * 0.2),
        category: category.label,
      }));
    });

    // Scales
    const x = d3.scaleLinear()
      .domain([0, timePoints - 1])
      .range([0, chartWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(stackData.flat(), d => d.y) || 0])
      .nice()
      .range([chartHeight, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.label))
      .range(Object.values(BLOOMBERG_COLORS).slice(0, data.length));

    // Area generator
    const area = d3.area<any>()
      .x(d => x(d.x))
      .y0(chartHeight)
      .y1(d => y(d.y))
      .curve(d3.curveBasis);

    // Draw areas
    stackData.forEach((categoryData, i) => {
      const path = g.append("path")
        .datum(categoryData)
        .attr("fill", colorScale(categoryData[0].category) as string)
        .attr("opacity", 0.7)
        .attr("d", area);

      if (animate) {
        const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 0;
        path
          .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
          .attr("stroke-dashoffset", totalLength)
          .transition()
          .duration(2000)
          .attr("stroke-dashoffset", 0);
      }
    });

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", "#ffffff80");

    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => formatValue(d as number)))
      .selectAll("text")
      .attr("fill", "#ffffff80");
  };

  useEffect(() => {
    if (type.startsWith('d3-')) {
      switch (type) {
        case 'd3-gauge':
        case 'd3-radial':
          renderD3RadialGauge();
          break;
        case 'd3-waterfall':
          renderD3Waterfall();
          break;
        case 'd3-river':
          renderD3River();
          break;
      }
    }
  }, [data, type, animate]);

  // Render Chart.js charts
  if (type === 'bar' || type === 'line' || type === 'pie' || type === 'doughnut') {
    const { data: chartData, options } = getChartJsConfig();
    const ChartComponent = type === 'bar' ? Bar : type === 'line' ? Line : type === 'pie' ? Pie : Doughnut;

    return (
      <motion.div
        initial={animate ? { opacity: 0, y: 20 } : {}}
        animate={animate ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary font-bold uppercase tracking-wide text-sm">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: `${height}px` }}>
              <ChartComponent data={chartData} options={options} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Render D3 charts
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : {}}
      animate={animate ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary font-bold uppercase tracking-wide text-sm">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg ref={d3ContainerRef} style={{ width: '100%', height: `${height}px` }} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
