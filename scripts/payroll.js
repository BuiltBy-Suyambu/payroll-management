// ===== Payroll Processing =====

// Initialize month picker
function initializePayrollMonth() {
    const monthInput = document.getElementById('payroll-month');
    if (monthInput) {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        monthInput.value = `${now.getFullYear()}-${month}`;
    }
}

// Generate payroll for selected month
function generatePayroll() {
    const month = document.getElementById('payroll-month')?.value;
    if (!month) return;

    const [year, monthNum] = month.split('-').map(Number);
    const workingDays = getWorkingDaysInMonth(year, monthNum - 1);

    payrollData[month] = employees.map(emp => {
        // Get all attendance records for this month (dates like "2026-04-08")
        const allMonthAttendance = Object.entries(attendanceData)
            .filter(([date]) => date.startsWith(month))
            .flatMap(([, records]) => records);
        
        const empRecords = allMonthAttendance.filter(a => a.empId === emp.id);
        const presentDays = empRecords.filter(r => r.status === 'present').length;

        // Calculate salary components
        const perDaySalary = emp.salary / workingDays;
        const earnedSalary = Math.round(perDaySalary * presentDays);
        const bonus = Math.round(earnedSalary * 0.1); // 10% bonus
        const deductions = Math.round(earnedSalary * 0.05); // 5% deductions
        const netSalary = earnedSalary + bonus - deductions;

        return {
            empId: emp.id,
            name: emp.name,
            department: emp.department,
            workingDays: presentDays,
            baseSalary: earnedSalary,
            bonus,
            deductions,
            netSalary,
            status: 'pending'
        };
    });

    saveData();
    renderPayrollTable();
    updatePayrollSummary();
}

// Render payroll table
function renderPayrollTable() {
    const tbody = document.getElementById('payroll-table-body');
    const month = document.getElementById('payroll-month')?.value;

    if (!tbody) return;

    const payroll = payrollData[month] || [];

    if (payroll.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 2rem;">Click "Generate Payroll" to calculate salaries</td></tr>';
        return;
    }

    tbody.innerHTML = payroll.map(p => `
        <tr>
            <td>${p.empId}</td>
            <td>${p.name}</td>
            <td>${p.department}</td>
            <td>${p.workingDays}</td>
            <td>${formatCurrency(p.baseSalary)}</td>
            <td>${formatCurrency(p.bonus)}</td>
            <td>${formatCurrency(p.deductions)}</td>
            <td><strong>${formatCurrency(p.netSalary)}</strong></td>
            <td>
                <span class="status-select ${p.status === 'paid' ? 'status-present' : 'status-late'}">
                    ${p.status.toUpperCase()}
                </span>
            </td>
            <td>
                <button class="action-btn btn-view" onclick="viewSalarySlip('${p.empId}', '${month}')">View Slip</button>
                ${p.status === 'pending' ? `<button class="action-btn btn-edit" onclick="markAsPaid('${p.empId}', '${month}')">Mark Paid</button>` : ''}
            </td>
        </tr>
    `).join('');
}

// Update payroll summary
function updatePayrollSummary() {
    const month = document.getElementById('payroll-month')?.value;
    const payroll = payrollData[month] || [];

    const total = payroll.length;
    const gross = payroll.reduce((sum, p) => sum + p.baseSalary + p.bonus, 0);
    const deductions = payroll.reduce((sum, p) => sum + p.deductions, 0);
    const net = payroll.reduce((sum, p) => sum + p.netSalary, 0);

    document.getElementById('summary-total').textContent = total;
    document.getElementById('summary-gross').textContent = formatCurrency(gross);
    document.getElementById('summary-deductions').textContent = formatCurrency(deductions);
    document.getElementById('summary-net').textContent = formatCurrency(net);
}

// View salary slip
function viewSalarySlip(empId, month) {
    const payroll = payrollData[month]?.find(p => p.empId === empId);
    const employee = employees.find(e => e.id === empId);

    if (!payroll || !employee) return;

    document.getElementById('slip-month').textContent = month;
    document.getElementById('slip-name').textContent = employee.name;
    document.getElementById('slip-emp-id').textContent = employee.id;
    document.getElementById('slip-dept').textContent = employee.department;
    document.getElementById('slip-base').textContent = formatCurrency(payroll.baseSalary);
    document.getElementById('slip-bonus').textContent = formatCurrency(payroll.bonus);
    document.getElementById('slip-earnings').textContent = formatCurrency(payroll.baseSalary + payroll.bonus);
    document.getElementById('slip-tax').textContent = formatCurrency(payroll.deductions * 0.7);
    document.getElementById('slip-other-ded').textContent = formatCurrency(payroll.deductions * 0.3);
    document.getElementById('slip-total-ded').textContent = formatCurrency(payroll.deductions);
    document.getElementById('slip-net').textContent = formatCurrency(payroll.netSalary);

    document.getElementById('slip-modal').classList.add('show');
}

// Mark as paid
function markAsPaid(empId, month) {
    const payroll = payrollData[month];
    if (!payroll) return;

    const record = payroll.find(p => p.empId === empId);
    if (record) {
        record.status = 'paid';
        saveData();
        renderPayrollTable();
        updatePayrollSummary();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializePayrollMonth();
});
