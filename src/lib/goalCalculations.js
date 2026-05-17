export function calculateProgressScore(uomType, targetValue, actualValue, targetDate, actualDate) {
  if (actualValue === null && actualDate === null) return null;
  switch (uomType) {
    case 'numeric_min': case 'percent_min':
      if (!targetValue || targetValue === 0) return 0;
      return Math.min((actualValue / targetValue) * 100, 150);
    case 'numeric_max': case 'percent_max':
      if (!actualValue || actualValue === 0) return 0;
      return Math.min((targetValue / actualValue) * 100, 150);
    case 'timeline':
      if (!targetDate || !actualDate) return 0;
      const target = new Date(targetDate), actual = new Date(actualDate);
      if (actual <= target) return 100;
      return Math.max(0, 100 - Math.floor((actual - target) / 86400000) * 5);
    case 'zero_based':
      return actualValue === 0 ? 100 : 0;
    default: return 0;
  }
}

export function validateGoalSheet(goals) {
  const errors = [];
  if (goals.length === 0) { errors.push('At least one goal is required'); return { valid: false, errors }; }
  if (goals.length > 8) errors.push('Maximum 8 goals allowed per employee');
  const totalWeightage = goals.reduce((sum, g) => sum + (Number(g.weightage) || 0), 0);
  if (Math.abs(totalWeightage - 100) > 0.01) errors.push(`Total weightage must equal 100% (currently ${totalWeightage}%)`);
  goals.forEach((goal, i) => {
    if (Number(goal.weightage) < 10) errors.push(`Goal ${i + 1}: Minimum weightage is 10%`);
    if (!goal.title?.trim()) errors.push(`Goal ${i + 1}: Title is required`);
    if (!goal.uom_type) errors.push(`Goal ${i + 1}: Unit of Measurement is required`);
    if (['numeric_min', 'numeric_max', 'percent_min', 'percent_max'].includes(goal.uom_type) && !goal.target_value) errors.push(`Goal ${i + 1}: Target value is required`);
    if (goal.uom_type === 'timeline' && !goal.target_date) errors.push(`Goal ${i + 1}: Target date is required`);
  });
  return { valid: errors.length === 0, errors };
}

export const UOM_LABELS = {
  numeric_min: 'Numeric (Higher is Better)', numeric_max: 'Numeric (Lower is Better)',
  percent_min: 'Percentage (Higher is Better)', percent_max: 'Percentage (Lower is Better)',
  timeline: 'Timeline (Date-based)', zero_based: 'Zero-based (Zero = Success)',
};

export const STATUS_COLORS = {
  draft: '#64748b', submitted: '#f59e0b', approved: '#22c55e', returned: '#ef4444', locked: '#8b5cf6',
  not_started: '#94a3b8', on_track: '#3b82f6', completed: '#10b981',
};

export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
