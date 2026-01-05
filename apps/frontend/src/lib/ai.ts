// Free AI features for finance app
// Rule-based AI for categorization and insights

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Expense {
  id: string;
  amount: string;
  description: string;
  category_name: string;
}

// Keyword-based categorization rules
const CATEGORIZATION_RULES = {
  'Food & Dining': [
    'ăn', 'food', 'restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'bữa',
    'cơm', 'phở', 'bún', 'mì', 'pizza', 'burger', 'noodle', 'rice'
  ],
  'Transportation': [
    'taxi', 'bus', 'train', 'gas', 'fuel', 'xăng', 'xe', 'car', 'taxi',
    'grab', 'uber', 'vé', 'ticket', 'airport', 'bay', 'plane'
  ],
  'Shopping': [
    'mua', 'shop', 'mua sắm', 'quần áo', 'clothes', 'giày', 'shoes',
    'sách', 'book', 'vật phẩm', 'item', 'mua hàng'
  ],
  'Entertainment': [
    'phim', 'movie', 'game', 'trò chơi', 'party', 'tiệc', 'concert',
    'sự kiện', 'event', 'du lịch', 'travel', 'vacation'
  ],
  'Bills & Utilities': [
    'điện', 'nước', 'internet', 'phone', 'điện thoại', 'tiền nhà',
    'rent', 'thuê', 'bill', 'hóa đơn', 'utility'
  ],
  'Health & Medical': [
    'bệnh', 'doctor', 'thuốc', 'medicine', 'bệnh viện', 'hospital',
    'khám', 'checkup', 'dental', 'nha khoa'
  ]
};

export function suggestCategory(description: string, categories: Category[]): Category | null {
  if (!description || !categories.length) return null;

  const desc = description.toLowerCase().trim();

  // Check each category's keywords
  for (const [categoryName, keywords] of Object.entries(CATEGORIZATION_RULES)) {
    for (const keyword of keywords) {
      if (desc.includes(keyword)) {
        // Find the matching category object
        const category = categories.find(cat => cat.name === categoryName);
        if (category) return category;
      }
    }
  }

  return null;
}

export function generateFinancialInsights(expenses: Expense[], income: number, expensesTotal: number): Array<{
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  icon: string;
}> {
  const insights: Array<{
    type: 'success' | 'warning' | 'danger' | 'info';
    title: string;
    message: string;
    icon: string;
  }> = [];

  // Return empty insights if no expenses
  if (!expenses || expenses.length === 0) {
    return insights;
  }

  // Analyze spending patterns
  const categorySpending = expenses.reduce((acc, expense) => {
    const category = expense.category_name;
    acc[category] = (acc[category] || 0) + parseFloat(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  // Find highest spending category
  const categoryEntries = Object.entries(categorySpending);
  if (categoryEntries.length > 0) {
    const topCategory = categoryEntries.reduce((a, b) =>
      categorySpending[a[0]] > categorySpending[b[0]] ? a : b
    );

    if (topCategory) {
      insights.push({
        type: 'warning',
        title: 'Chi tiêu nhiều nhất',
        message: `Bạn chi tiêu nhiều nhất cho ${topCategory[0]} (${formatCurrency(topCategory[1])}). Hãy xem xét giảm chi tiêu ở mục này.`,
        icon: '⚠️'
      });
    }
  }

  // Savings potential
  const dailyAverage = expensesTotal / 30;
  if (dailyAverage > 100000) { // Assuming VND
    insights.push({
      type: 'success',
      title: 'Tiết kiệm hàng ngày',
      message: `Bạn có thể tiết kiệm ${formatCurrency(dailyAverage * 0.1)} mỗi ngày bằng cách giảm 10% chi tiêu.`,
      icon: '💰'
    });
  }

  // Income vs expenses ratio
  const savingsRate = income > 0 ? ((income - expensesTotal) / income) * 100 : 0;
  if (savingsRate > 20) {
    insights.push({
      type: 'success',
      title: 'Quản lý tài chính tốt',
      message: `Tỷ lệ tiết kiệm của bạn là ${savingsRate.toFixed(1)}%. Tiếp tục giữ gìn!`,
      icon: '🎉'
    });
  } else if (savingsRate < 0) {
    insights.push({
      type: 'danger',
      title: 'Cảnh báo chi tiêu',
      message: `Bạn đang chi tiêu nhiều hơn thu nhập. Hãy lập kế hoạch ngân sách ngay!`,
      icon: '🚨'
    });
  }

  // Frequent small purchases
  if (expenses.length > 0) {
    const smallPurchases = expenses.filter(e => parseFloat(e.amount) < 50000).length;
    if (smallPurchases > expenses.length * 0.5) {
      insights.push({
        type: 'info',
        title: 'Chi tiêu nhỏ lẻ',
        message: `Bạn có nhiều giao dịch nhỏ. Hãy xem xét mua hàng số lượng lớn để tiết kiệm.`,
        icon: '🛒'
      });
    }
  }

  return insights;
}

export function generateSavingsGoals(currentSavings: number, monthlyIncome: number) {
  const goals = [];

  // Emergency fund (3-6 months of expenses)
  const emergencyFund = monthlyIncome * 3;
  if (currentSavings < emergencyFund) {
    goals.push({
      title: 'Quỹ dự phòng',
      target: emergencyFund,
      current: currentSavings,
      monthly: monthlyIncome * 0.2,
      description: 'Mục tiêu: 3 tháng chi phí sinh hoạt'
    });
  }

  // Short-term goals
  goals.push({
    title: 'Mua sắm cuối năm',
    target: monthlyIncome * 2,
    current: currentSavings * 0.5,
    monthly: monthlyIncome * 0.15,
    description: 'Tiết kiệm cho các khoản chi cuối năm'
  });

  // Long-term goals
  goals.push({
    title: 'Đầu tư',
    target: monthlyIncome * 12,
    current: currentSavings * 0.3,
    monthly: monthlyIncome * 0.1,
    description: 'Tích lũy cho các khoản đầu tư dài hạn'
  });

  return goals;
}

// Simple currency formatter for AI functions
function formatCurrency(amount: number, currency: string = 'VND'): string {
  const config = {
    USD: { symbol: '$', decimals: 2 },
    EUR: { symbol: '€', decimals: 2 },
    GBP: { symbol: '£', decimals: 2 },
    JPY: { symbol: '¥', decimals: 0 },
    VND: { symbol: '₫', decimals: 0 },
  };

  const c = config[currency as keyof typeof config] || config.VND;
  return `${c.symbol}${amount.toFixed(c.decimals)}`;
}