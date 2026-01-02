import Expense from '../models/Expense.js';
import Income from '../models/Income.js';

export const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: 'year and month are required' });
    }

    const expenses = await Expense.findByMonth(req.userId, parseInt(year), parseInt(month));
    const categoryTotals = await Expense.getTotalByCategory(req.userId, parseInt(year), parseInt(month));
    const monthlyTotal = await Expense.getMonthlyTotal(req.userId, parseInt(year), parseInt(month));

    // Calculate stats
    const avgExpense = expenses.length > 0 ? monthlyTotal / expenses.length : 0;
    const topCategory = categoryTotals.length > 0 ? categoryTotals[0] : null;

    res.json({
      year: parseInt(year),
      month: parseInt(month),
      totalExpenses: monthlyTotal,
      transactionCount: expenses.length,
      averageExpense: Math.round(avgExpense * 100) / 100,
      topCategory,
      categoryBreakdown: categoryTotals,
      transactions: expenses,
    });
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategoryTrends = async (req, res) => {
  try {
    const { categoryId, months = 6 } = req.query;

    if (!categoryId) {
      return res.status(400).json({ error: 'categoryId is required' });
    }

    const currentDate = new Date();
    const trends = [];

    for (let i = parseInt(months) - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const total = await Expense.getMonthlyTotal(req.userId, year, month);
      trends.push({
        year,
        month,
        total: total || 0,
      });
    }

    res.json({
      categoryId,
      trends,
    });
  } catch (error) {
    console.error('Get category trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSummary = async (req, res) => {
  try {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    console.log(`Getting summary for user ${req.userId}, year ${year}, month ${month}`);

    const monthlyExpenses = await Expense.findByMonth(req.userId, year, month);
    const categoryTotals = await Expense.getTotalByCategory(req.userId, year, month);
    const monthlyExpenseTotal = await Expense.getMonthlyTotal(req.userId, year, month);
    const monthlyIncomeTotal = await Income.getMonthlyTotal(req.userId, year, month);

    console.log(`Monthly expenses: ${monthlyExpenseTotal}, income: ${monthlyIncomeTotal}, expenses count: ${monthlyExpenses.length}, category totals: ${categoryTotals.length}`);

    // Calculate average daily spend
    const daysInMonth = new Date(year, month, 0).getDate();
    const avgDailySpend = Math.round((monthlyExpenseTotal / daysInMonth) * 100) / 100;

    // Total balance: income - expenses
    const totalBalance = monthlyIncomeTotal - monthlyExpenseTotal;

    res.json({
      currentMonth: month,
      currentYear: year,
      totalBalance,
      monthlyIncome: monthlyIncomeTotal,
      monthlyExpenses: monthlyExpenseTotal,
      transactionCount: monthlyExpenses.length,
      averageDailySpend: avgDailySpend,
      topCategories: categoryTotals.slice(0, 5),
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getExpenseTrends = async (req, res) => {
  try {
    const { period = 'monthly', months = 6 } = req.query;
    const userId = req.userId;

    const trends = [];
    const currentDate = new Date();

    for (let i = parseInt(months) - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const total = await Expense.getMonthlyTotal(userId, year, month);
      const transactionCount = await Expense.findByMonth(userId, year, month).then(expenses => expenses.length);

      trends.push({
        year,
        month,
        period: `${year}-${month.toString().padStart(2, '0')}`,
        total: total || 0,
        transactionCount,
        averageTransaction: transactionCount > 0 ? Math.round((total / transactionCount) * 100) / 100 : 0,
      });
    }

    res.json({ trends });
  } catch (error) {
    console.error('Get expense trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategoryAnalytics = async (req, res) => {
  try {
    const { year, month } = req.query;
    const userId = req.userId;

    let categoryData;
    if (year && month) {
      // Specific month
      categoryData = await Expense.getTotalByCategory(userId, parseInt(year), parseInt(month));
    } else {
      // Current month
      const currentDate = new Date();
      categoryData = await Expense.getTotalByCategory(userId, currentDate.getFullYear(), currentDate.getMonth() + 1);
    }

    const totalExpenses = categoryData.reduce((sum, cat) => sum + parseFloat(cat.total), 0);

    const analytics = categoryData.map(cat => ({
      ...cat,
      percentage: totalExpenses > 0 ? Math.round((parseFloat(cat.total) / totalExpenses) * 100 * 100) / 100 : 0,
    }));

    res.json({
      categories: analytics,
      totalExpenses,
      period: year && month ? `${year}-${month}` : 'current',
    });
  } catch (error) {
    console.error('Get category analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMonthlyComparison = async (req, res) => {
  try {
    const userId = req.userId;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Current month
    const currentTotal = await Expense.getMonthlyTotal(userId, currentYear, currentMonth);
    const currentTransactions = await Expense.findByMonth(userId, currentYear, currentMonth);

    // Previous month
    const prevDate = new Date(currentYear, currentMonth - 2, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = prevDate.getMonth() + 1;
    const prevTotal = await Expense.getMonthlyTotal(userId, prevYear, prevMonth);
    const prevTransactions = await Expense.findByMonth(userId, prevYear, prevMonth);

    const comparison = {
      current: {
        year: currentYear,
        month: currentMonth,
        total: currentTotal,
        transactionCount: currentTransactions.length,
        averageTransaction: currentTransactions.length > 0 ? Math.round((currentTotal / currentTransactions.length) * 100) / 100 : 0,
      },
      previous: {
        year: prevYear,
        month: prevMonth,
        total: prevTotal,
        transactionCount: prevTransactions.length,
        averageTransaction: prevTransactions.length > 0 ? Math.round((prevTotal / prevTransactions.length) * 100) / 100 : 0,
      },
      change: {
        amount: currentTotal - prevTotal,
        percentage: prevTotal > 0 ? Math.round(((currentTotal - prevTotal) / prevTotal) * 100 * 100) / 100 : 0,
        transactionChange: currentTransactions.length - prevTransactions.length,
      }
    };

    res.json(comparison);
  } catch (error) {
    console.error('Get monthly comparison error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
