// Payroll Management System - Main JavaScript

// ===== Employee Data =====
let employees = [
    { id: 1, name: "Rahul Kumar", dept: "IT", position: "Developer", salary: 45000, email: "rahul@company.com", joinDate: "2024-01-15" },
    { id: 2, name: "Priya Sharma", dept: "HR", position: "Manager", salary: 55000, email: "priya@company.com", joinDate: "2023-06-20" },
    { id: 3, name: "Amit Patel", dept: "Finance", position: "Accountant", salary: 40000, email: "amit@company.com", joinDate: "2024-02-10" },
    { id: 4, name: "Sneha Singh", dept: "Sales", position: "Executive", salary: 35000, email: "sneha@company.com", joinDate: "2024-03-01" },
    { id: 5, name: "Vikram Mehta", dept: "IT", position: "Senior Developer", salary: 65000, email: "vikram@company.com", joinDate: "2022-08-15" }
];

// Attendance and payroll storage
let attendance = {};
let payroll = {};
let empIdCounter = 6;

// ===== UTILITY FUNCTIONS =====

function formatCurrency(amount) {
    return "₹" + parseInt(amount).toLocaleString('en-IN');
}

function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

function getCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return year + "-" + month;
}

function updateHomeStats() {
    const totalEmpEl = document.getElementById("totalEmployees");
    const presentTodayEl = document.getElementById("presentToday");
    const monthlySalaryEl = document.getElementById("monthlySalary");

    if (totalEmpEl) {
        totalEmpEl.textContent = employees.length;
    }

    if (presentTodayEl) {
        const today = getCurrentDate();
        let presentCount = 0;
        employees.forEach(function(emp) {
            if (attendance[today + "_" + emp.id] === "present") {
                presentCount++;
            }
        });
        presentTodayEl.textContent = presentCount;
    }

    if (monthlySalaryEl) {
        let total = 0;
        employees.forEach(function(emp) {
            total += parseInt(emp.salary);
        });
        monthlySalaryEl.textContent = formatCurrency(total);
    }
}

// ===== EMPLOYEE FUNCTIONS =====

function toggleForm() {
    const formBox = document.getElementById("employeeFormBox");
    if (formBox) {
        formBox.style.display = formBox.style.display === "none" ? "block" : "none";
    }
}

function displayEmployees(data = employees) {
    const table = document.getElementById("employeeTable");
    if (!table) return;

    table.innerHTML = "";

    if (data.length === 0) {
        table.innerHTML = "<tr><td colspan='7' style='text-align:center;padding:20px;'>No employees found</td></tr>";
        return;
    }

    data.forEach(function(emp) {
        const row = table.insertRow();
        row.innerHTML = `
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${emp.dept}</td>
            <td>${emp.position}</td>
            <td>${emp.email || '-'}</td>
            <td>${formatCurrency(emp.salary)}</td>
            <td>
                <button class="action-btn btn-delete" onclick="deleteEmployee(${emp.id})">Delete</button>
            </td>
        `;
    });
}

document.getElementById("employeeForm")?.addEventListener("submit", function(e) {
    e.preventDefault();

    const newEmp = {
        id: empIdCounter++,
        name: document.getElementById("empName").value,
        dept: document.getElementById("empDept").value,
        position: document.getElementById("empPosition").value,
        salary: parseInt(document.getElementById("empSalary").value),
        email: document.getElementById("empEmail").value,
        joinDate: document.getElementById("empJoinDate").value
    };

    employees.push(newEmp);
    displayEmployees();
    updateHomeStats();

    document.getElementById("employeeForm").reset();
    toggleForm();

    alert("Employee added successfully! ID: " + newEmp.id);
});

function deleteEmployee(id) {
    if (confirm("Are you sure you want to delete employee ID " + id + "?")) {
        employees = employees.filter(emp => emp.id !== id);
        displayEmployees();
        updateHomeStats();
        alert("Employee deleted successfully!");
    }
}

function searchEmployee() {
    const search = document.getElementById("searchBox").value.toLowerCase();

    if (!search) {
        displayEmployees(employees);
        return;
    }

    const filtered = employees.filter(emp =>
        emp.name.toLowerCase().includes(search) ||
        emp.dept.toLowerCase().includes(search) ||
        emp.position.toLowerCase().includes(search)
    );

    displayEmployees(filtered);
}

// ===== ATTENDANCE FUNCTIONS =====

function loadAttendance() {
    const date = document.getElementById("attendanceDate").value;
    const deptFilter = document.getElementById("deptFilter")?.value || "all";
    const table = document.getElementById("attendanceTable");

    if (!table) return;

    table.innerHTML = "";

    let filteredEmployees = employees;
    if (deptFilter !== "all") {
        filteredEmployees = employees.filter(emp => emp.dept === deptFilter);
    }

    filteredEmployees.forEach(function(emp) {
        const row = table.insertRow();
        const savedStatus = attendance[date + "_" + emp.id] || "present";

        row.innerHTML = `
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${emp.dept}</td>
            <td>
                <select class="status-select" id="status_${emp.id}">
                    <option value="present" ${savedStatus === "present" ? "selected" : ""}>Present</option>
                    <option value="absent" ${savedStatus === "absent" ? "selected" : ""}>Absent</option>
                </select>
            </td>
        `;
    });
}

function filterByDept() {
    loadAttendance();
}

function markAll(status) {
    const selects = document.querySelectorAll("#attendanceTable select");
    selects.forEach(function(select) {
        select.value = status;
    });
}

function saveAttendance() {
    const date = document.getElementById("attendanceDate").value;
    const deptFilter = document.getElementById("deptFilter")?.value || "all";

    let filteredEmployees = employees;
    if (deptFilter !== "all") {
        filteredEmployees = employees.filter(emp => emp.dept === deptFilter);
    }

    let presentCount = 0;
    filteredEmployees.forEach(function(emp) {
        const status = document.getElementById("status_" + emp.id).value;
        attendance[date + "_" + emp.id] = status;
        if (status === "present") presentCount++;
    });

    alert("Attendance saved for " + date + "\nPresent: " + presentCount + " | Absent: " + (filteredEmployees.length - presentCount));
    updateHomeStats();
}

// ===== PAYROLL FUNCTIONS =====

function generatePayroll() {
    const month = document.getElementById("payrollMonth").value;
    const table = document.getElementById("payrollTable");
    const summaryDiv = document.getElementById("payrollSummary");

    if (!table) return;

    table.innerHTML = "";
    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    let empCount = 0;

    employees.forEach(function(emp) {
        let presentDays = 0;
        for (let key in attendance) {
            if (key.startsWith(month) && key.includes("_" + emp.id)) {
                if (attendance[key] === "present") {
                    presentDays++;
                }
            }
        }

        if (presentDays === 0) presentDays = 26;

        const perDaySalary = emp.salary / 26;
        const grossSalary = Math.round(perDaySalary * presentDays);
        const deductions = Math.round(grossSalary * 0.1);
        const netSalary = grossSalary - deductions;

        totalGross += grossSalary;
        totalDeductions += deductions;
        totalNet += netSalary;
        empCount++;

        const row = table.insertRow();
        row.innerHTML = `
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${emp.dept}</td>
            <td>${formatCurrency(emp.salary)}</td>
            <td>${presentDays}</td>
            <td>${formatCurrency(deductions)}</td>
            <td><strong>${formatCurrency(netSalary)}</strong></td>
            <td>
                <button class="action-btn btn-view" onclick="showSlip('${emp.name}', '${emp.id}', '${emp.dept}', '${emp.salary}', '${presentDays}', '${deductions}', '${netSalary}', '${month}')">View Slip</button>
            </td>
        `;

        payroll[emp.id] = {
            name: emp.name,
            dept: emp.dept,
            salary: emp.salary,
            presentDays: presentDays,
            deductions: deductions,
            netSalary: netSalary,
            month: month
        };
    });

    document.getElementById("totalEmp").textContent = empCount;
    document.getElementById("grossSalary").textContent = formatCurrency(totalGross);
    document.getElementById("totalDeductions").textContent = formatCurrency(totalDeductions);
    document.getElementById("netPayable").textContent = formatCurrency(totalNet);

    if (summaryDiv) {
        summaryDiv.style.display = "block";
    }
}

function showSlip(name, id, dept, salary, days, deductions, net, month) {
    document.getElementById("slipName").textContent = name;
    document.getElementById("slipId").textContent = id;
    document.getElementById("slipDept").textContent = dept;
    document.getElementById("slipBasic").textContent = formatCurrency(salary);
    document.getElementById("slipDays").textContent = days + " days";
    document.getElementById("slipDeductions").textContent = formatCurrency(deductions);
    document.getElementById("slipNet").textContent = formatCurrency(net);
    document.getElementById("slipMonth").textContent = month;

    document.getElementById("slipModal").classList.add("show");
}

function closeModal() {
    document.getElementById("slipModal").classList.remove("show");
}

window.onclick = function(event) {
    const modal = document.getElementById("slipModal");
    if (event.target === modal) {
        closeModal();
    }
}

// ===== REPORT FUNCTIONS =====

function loadReport() {
    const month = document.getElementById("reportMonth").value;
    const table = document.getElementById("reportTable");
    const deptChart = document.getElementById("deptChart");

    if (!table) return;

    table.innerHTML = "";

    const deptData = {};
    let totalSalary = 0;
    let totalPresent = 0;
    let totalPossible = employees.length * 26;

    employees.forEach(function(emp) {
        let presentDays = 0;
        for (let key in attendance) {
            if (key.startsWith(month) && key.includes("_" + emp.id)) {
                if (attendance[key] === "present") {
                    presentDays++;
                }
            }
        }

        if (presentDays === 0) presentDays = 26;
        totalPresent += presentDays;

        const perDaySalary = emp.salary / 26;
        const grossSalary = Math.round(perDaySalary * presentDays);
        const deductions = Math.round(grossSalary * 0.1);
        const netSalary = grossSalary - deductions;
        totalSalary += netSalary;

        if (!deptData[emp.dept]) {
            deptData[emp.dept] = { salary: 0, count: 0 };
        }
        deptData[emp.dept].salary += netSalary;
        deptData[emp.dept].count++;

        const row = table.insertRow();
        row.innerHTML = `
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${emp.dept}</td>
            <td>${presentDays}</td>
            <td><strong>${formatCurrency(netSalary)}</strong></td>
            <td><span class="status-present">PAID</span></td>
        `;
    });

    document.getElementById("totalEmployees").textContent = employees.length;
    document.getElementById("workingDays").textContent = "26";
    document.getElementById("totalSalary").textContent = formatCurrency(totalSalary);

    const attendancePercent = Math.round((totalPresent / totalPossible) * 100);
    document.getElementById("avgAttendance").textContent = attendancePercent + "%";

    if (deptChart) {
        const maxSalary = Math.max(...Object.values(deptData).map(d => d.salary));

        deptChart.innerHTML = "";
        for (let dept in deptData) {
            const width = Math.round((deptData[dept].salary / maxSalary) * 100);
            const bar = document.createElement("div");
            bar.className = "chart-bar";
            bar.innerHTML = `
                <span class="chart-label">${dept}</span>
                <div class="chart-track">
                    <div class="chart-fill" style="width: ${width}%"></div>
                </div>
                <span class="chart-value">${formatCurrency(deptData[dept].salary)}</span>
            `;
            deptChart.appendChild(bar);
        }
    }
}

function exportReport() {
    const month = document.getElementById("reportMonth").value;
    alert("Export feature for " + month + "\n\nIn a real application, this would download a CSV/PDF file with all salary details.");
}

// ===== INITIALIZATION =====

window.onload = function() {
    const today = getCurrentDate();
    const currentMonth = getCurrentMonth();

    const attendanceDate = document.getElementById("attendanceDate");
    if (attendanceDate) attendanceDate.value = today;

    const payrollMonth = document.getElementById("payrollMonth");
    if (payrollMonth) payrollMonth.value = currentMonth;

    const reportMonth = document.getElementById("reportMonth");
    if (reportMonth) reportMonth.value = currentMonth;

    displayEmployees();
    updateHomeStats();
    loadAttendance();
};
