// ===== Main JavaScript File =====

// Sample employee data
let employees = JSON.parse(localStorage.getItem('employees')) || [
    { id: 'EMP001', name: 'John Doe', department: 'IT', position: 'Software Developer', salary: 50000, joinDate: '2024-01-15' },
    { id: 'EMP002', name: 'Jane Smith', department: 'HR', position: 'HR Manager', salary: 60000, joinDate: '2023-06-20' },
    { id: 'EMP003', name: 'Mike Johnson', department: 'Finance', position: 'Accountant', salary: 45000, joinDate: '2024-03-10' },
    { id: 'EMP004', name: 'Sarah Williams', department: 'Sales', position: 'Sales Executive', salary: 40000, joinDate: '2024-02-01' },
    { id: 'EMP005', name: 'Emily Brown', department: 'Marketing', position: 'Marketing Specialist', salary: 42000, joinDate: '2023-11-05' }
];

// Attendance data
let attendanceData = JSON.parse(localStorage.getItem('attendance')) || {};

// Payroll data
let payrollData = JSON.parse(localStorage.getItem('payroll')) || {};

// Save to localStorage
function saveData() {
    localStorage.setItem('employees', JSON.stringify(employees));
    localStorage.setItem('attendance', JSON.stringify(attendanceData));
    localStorage.setItem('payroll', JSON.stringify(payrollData));
}

// Format currency
function formatCurrency(amount) {
    return '₹' + parseInt(amount).toLocaleString('en-IN');
}

// Generate unique ID
function generateId() {
    return 'EMP' + String(employees.length + 1).padStart(3, '0');
}

// Calculate working days in a month
function getWorkingDaysInMonth(year, month) {
    const date = new Date(year, month, 1);
    let days = 0;
    while (date.getMonth() === month) {
        const day = date.getDay();
        if (day !== 0 && day !== 6) days++;
        date.setDate(date.getDate() + 1);
    }
    return days;
}

// Update stats on homepage
function updateStats() {
    const totalEmployeesEl = document.getElementById('total-employees');
    const presentTodayEl = document.getElementById('present-today');
    const pendingPayrollEl = document.getElementById('pending-payroll');
    const totalSalaryEl = document.getElementById('total-salary');

    if (totalEmployeesEl) {
        totalEmployeesEl.textContent = employees.length;
    }

    if (presentTodayEl) {
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = attendanceData[today] || [];
        presentTodayEl.textContent = todayAttendance.filter(a => a.status === 'present').length;
    }

    if (pendingPayrollEl) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthPayroll = payrollData[currentMonth] || [];
        pendingPayrollEl.textContent = monthPayroll.filter(p => p.status === 'pending').length;
    }

    if (totalSalaryEl) {
        const totalSalary = employees.reduce((sum, emp) => sum + parseInt(emp.salary), 0);
        totalSalaryEl.textContent = formatCurrency(totalSalary);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
});

// ===== Modal Functions =====
function showAddEmployeeModal() {
    document.getElementById('modal-title').textContent = 'Add Employee';
    document.getElementById('employee-form').reset();
    document.getElementById('emp-id').value = '';
    document.getElementById('employee-modal').classList.add('show');
}

function closeModal() {
    document.getElementById('employee-modal').classList.remove('show');
}

function closeSlipModal() {
    document.getElementById('slip-modal').classList.remove('show');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const employeeModal = document.getElementById('employee-modal');
    const slipModal = document.getElementById('slip-modal');
    if (event.target === employeeModal) {
        closeModal();
    }
    if (event.target === slipModal) {
        closeSlipModal();
    }
}
