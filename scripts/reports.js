// ===== Reports & Analytics =====

// Initialize report page
function initializeReportMonth() {
    const monthInput = document.getElementById('report-month');
    if (monthInput) {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        monthInput.value = `${now.getFullYear()}-${month}`;
        loadReport();
    }
}

// Load selected report
function loadReport() {
    const reportType = document.getElementById('report-type')?.value || 'summary';
    const month = document.getElementById('report-month')?.value;

    if (!month) return;

    const payroll = payrollData[month] || [];

    // Update summary stats
    const totalPayroll = payroll.reduce((sum, p) => sum + p.netSalary, 0);
    const employeesPaid = payroll.filter(p => p.status === 'paid').length;
    const avgSalary = payroll.length > 0 ? Math.round(totalPayroll / payroll.length) : 0;

    // Calculate attendance rate
    const attendance = attendanceData[month] || [];
    const totalRecords = attendance.length;
    const presentRecords = attendance.filter(a => a.status === 'present').length;
    const attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

    document.getElementById('report-total').textContent = formatCurrency(totalPayroll);
    document.getElementById('report-count').textContent = employeesPaid;
    document.getElementById('report-avg').textContent = formatCurrency(avgSalary);
    document.getElementById('report-attendance').textContent = attendanceRate + '%';

    // Load department breakdown
    loadDepartmentChart(payroll);

    // Load recent records table
    loadReportTable(payroll);
}

// Load department chart
function loadDepartmentChart(payroll) {
    const container = document.getElementById('department-chart');
    if (!container) return;

    // Group by department
    const deptData = {};
    payroll.forEach(p => {
        if (!deptData[p.department]) {
            deptData[p.department] = 0;
        }
        deptData[p.department] += p.netSalary;
    });

    // Find max for scaling
    const maxSalary = Math.max(...Object.values(deptData), 1);

    // Render bars
    container.innerHTML = Object.entries(deptData).map(([dept, amount]) => {
        const percentage = Math.round((amount / maxSalary) * 100);
        return `
            <div class="chart-bar">
                <span class="chart-bar-label">${dept}</span>
                <div class="chart-bar-track">
                    <div class="chart-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="chart-bar-value">${formatCurrency(amount)}</span>
            </div>
        `;
    }).join('');
}

// Load report table
function loadReportTable(payroll) {
    const tbody = document.getElementById('report-table-body');
    if (!tbody) return;

    const recentRecords = payroll.slice(0, 10);

    tbody.innerHTML = recentRecords.map(p => `
        <tr>
            <td>${p.name}</td>
            <td>${p.department}</td>
            <td>${formatCurrency(p.netSalary)}</td>
            <td>
                <span class="status-select ${p.status === 'paid' ? 'status-present' : 'status-late'}">
                    ${p.status.toUpperCase()}
                </span>
            </td>
        </tr>
    `).join('');
}

// Export report to CSV
function exportReport() {
    const month = document.getElementById('report-month')?.value;
    const payroll = payrollData[month] || [];

    if (payroll.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = ['Employee ID', 'Name', 'Department', 'Base Salary', 'Bonus', 'Deductions', 'Net Salary', 'Status'];
    const csvContent = [
        headers.join(','),
        ...payroll.map(p => [
            p.empId,
            p.name,
            p.department,
            p.baseSalary,
            p.bonus,
            p.deductions,
            p.netSalary,
            p.status
        ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_report_${month}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeReportMonth();
});
