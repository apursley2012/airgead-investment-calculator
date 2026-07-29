import { money } from './calculator.js';

function setup(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.textBaseline = 'alphabetic';

  return { ctx, w: width, h: height };
}

function shortMoney(value) {
  const amount = Math.round(Number(value) || 0);
  if (Math.abs(amount) >= 1000000) {
    return `$${(amount / 1000000).toFixed(amount >= 10000000 ? 0 : 1)}m`;
  }
  if (Math.abs(amount) >= 1000) {
    return `$${Math.round(amount / 1000)}k`;
  }
  return `$${amount}`;
}

function drawLegendItem(ctx, x, y, color, label, type = 'box') {
  ctx.fillStyle = color;
  if (type === 'line') {
    ctx.fillRect(x, y + 5, 18, 4);
  } else {
    ctx.fillRect(x, y, 13, 13);
  }

  ctx.fillStyle = '#16251e';
  ctx.font = '600 12px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(label, x + (type === 'line' ? 26 : 21), y + 11);
}

function drawResponsiveLegend(ctx, width, items) {
  const compact = width < 520;
  ctx.font = '600 12px Inter, sans-serif';

  if (compact) {
    const longest = Math.max(...items.map(item => ctx.measureText(item.label).width));
    const groupWidth = longest + 47;
    const startX = Math.max(12, (width - groupWidth) / 2);

    items.forEach((item, index) => {
      drawLegendItem(ctx, startX, 12 + index * 24, item.color, item.label, item.type);
    });

    return 66;
  }

  const widths = items.map(item => ctx.measureText(item.label).width + 55);
  const totalWidth = widths.reduce((sum, itemWidth) => sum + itemWidth, 0);
  let x = Math.max(12, (width - totalWidth) / 2);

  items.forEach((item, index) => {
    drawLegendItem(ctx, x, 16, item.color, item.label, item.type);
    x += widths[index];
  });

  return 48;
}

function drawYAxis(ctx, dimensions, max) {
  const { left, right, top, bottom, width } = dimensions;
  const innerHeight = bottom - top;

  ctx.lineWidth = 1;
  ctx.strokeStyle = '#e7dfd0';
  ctx.fillStyle = 'rgba(22,37,30,.58)';
  ctx.font = `${width < 420 ? 10 : 12}px Inter, sans-serif`;
  ctx.textAlign = 'right';

  for (let index = 0; index <= 4; index += 1) {
    const y = top + (innerHeight / 4) * index;
    const value = max * (1 - index / 4);

    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
    ctx.fillText(shortMoney(value), left - 10, y + 4);
  }
}

export function drawGrowthChart(canvas, rows) {
  if (!canvas || !rows?.length) return;

  const { ctx, w, h } = setup(canvas);
  ctx.clearRect(0, 0, w, h);

  const legendBottom = drawResponsiveLegend(ctx, w, [
    { color: '#0f5132', label: 'With monthly deposits', type: 'line' },
    { color: '#9ba39d', label: 'Without deposits', type: 'line' }
  ]);

  const left = w < 420 ? 50 : 64;
  const right = w - 18;
  const top = legendBottom + 16;
  const bottom = h - 42;
  const innerWidth = Math.max(1, right - left);
  const innerHeight = Math.max(1, bottom - top);
  const max = Math.max(...rows.flatMap(row => [row.withDeposits, row.withoutDeposits])) * 1.08 || 1;
  const x = index => left + (rows.length === 1 ? 0 : index / (rows.length - 1)) * innerWidth;
  const y = value => top + innerHeight - (value / max) * innerHeight;

  drawYAxis(ctx, { left, right, top, bottom, width: w }, max);

  function drawArea(key, stroke, fill) {
    ctx.beginPath();
    rows.forEach((row, index) => {
      const pointX = x(index);
      const pointY = y(row[key]);
      if (index) ctx.lineTo(pointX, pointY);
      else ctx.moveTo(pointX, pointY);
    });
    ctx.lineTo(x(rows.length - 1), bottom);
    ctx.lineTo(x(0), bottom);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();

    ctx.beginPath();
    rows.forEach((row, index) => {
      const pointX = x(index);
      const pointY = y(row[key]);
      if (index) ctx.lineTo(pointX, pointY);
      else ctx.moveTo(pointX, pointY);
    });
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  drawArea('withDeposits', '#0f5132', 'rgba(15,81,50,.16)');
  drawArea('withoutDeposits', '#9ba39d', 'rgba(155,163,157,.12)');

  ctx.fillStyle = 'rgba(22,37,30,.65)';
  ctx.font = `${w < 420 ? 10 : 12}px Inter, sans-serif`;
  ctx.textAlign = 'center';

  const maxLabels = w < 420 ? 4 : 6;
  const step = Math.max(1, Math.ceil((rows.length - 1) / maxLabels));
  for (let index = 0; index < rows.length; index += step) {
    ctx.fillText(`Y${rows[index].year}`, x(index), h - 16);
  }

  const lastIndex = rows.length - 1;
  if (lastIndex % step !== 0) {
    ctx.fillText(`Y${rows[lastIndex].year}`, x(lastIndex), h - 16);
  }
}

export function drawComparisonChart(canvas, data) {
  if (!canvas || !data?.length) return;

  const { ctx, w, h } = setup(canvas);
  ctx.clearRect(0, 0, w, h);

  const legendBottom = drawResponsiveLegend(ctx, w, [
    { color: '#0f5132', label: 'Interest earned' },
    { color: '#b7bcb8', label: 'Total principal' }
  ]);

  const left = w < 420 ? 50 : 66;
  const right = w - 18;
  const top = legendBottom + 26;
  const bottom = h - 62;
  const innerWidth = Math.max(1, right - left);
  const innerHeight = Math.max(1, bottom - top);
  const maxBalance = Math.max(...data.map(item => item.balance)) || 1;
  const axisMax = maxBalance * 1.22;

  drawYAxis(ctx, { left, right, top, bottom, width: w }, axisMax);

  const barWidth = Math.min(w < 420 ? 62 : 96, innerWidth / (data.length * 2.5));

  data.forEach((item, index) => {
    const centerX = left + innerWidth * (index + 0.5) / data.length;
    const principalHeight = (item.principal / axisMax) * innerHeight;
    const interestHeight = (item.interest / axisMax) * innerHeight;
    const totalHeight = principalHeight + interestHeight;
    const barTop = bottom - totalHeight;

    ctx.fillStyle = '#b7bcb8';
    ctx.fillRect(centerX - barWidth / 2, bottom - principalHeight, barWidth, principalHeight);

    ctx.fillStyle = '#0f5132';
    ctx.fillRect(
      centerX - barWidth / 2,
      bottom - principalHeight - interestHeight,
      barWidth,
      interestHeight
    );

    ctx.fillStyle = '#0f5132';
    ctx.font = `700 ${w < 420 ? 11 : 12}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(money(item.balance), centerX, Math.max(top + 14, barTop - 10));

    ctx.fillStyle = '#16251e';
    ctx.font = `700 ${w < 420 ? 11 : 13}px Inter, sans-serif`;
    ctx.fillText(item.name, centerX, h - 26);
  });
}
