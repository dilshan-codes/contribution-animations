export const CELL = 10, GAP = 3, PAD = 5;
export const COLORS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

// Turns the data into positioned cells. day = weekday (0 = Sunday).
export function cells(data) {
  const items = [];
  data.weeks.forEach((w, week) =>
    w.days.forEach((d) => {
      const day = new Date(d.date + 'T00:00:00Z').getUTCDay();
      items.push({
        week, day, date: d.date, count: d.count, level: d.level,
        x: PAD + week * (CELL + GAP),
        y: PAD + day * (CELL + GAP),
      });
    })
  );
  const width = PAD * 2 + data.weeks.length * (CELL + GAP) - GAP;
  const height = PAD * 2 + 7 * (CELL + GAP) - GAP;
  return { items, width, height };
}