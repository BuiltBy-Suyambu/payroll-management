// ===== Employee Management =====

// Render employee table
function renderEmployeeTable(data = employees) {
    const tbody = document.getElementById('employee-table-body');
    if (!tbody) return;

    tbody.innerHTML = data.map(emp => `
        <tr>
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${emp.department}</td>
            <td>${emp.position}</td>
            <td>${formatCurrency(emp.salary)}</td>
            <td>${emp.joinDate}</td>
            <td>
                <button class="action-btn btn-edit" onclick="editEmployee('${emp.id}')">Edit</button>
                <button class="action-btn btn-delete" onclick="deleteEmployee('${emp.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Search employee
function searchEmployee() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtered = employees.filter(emp =>
        emp.name.toLowerCase().includes(query) ||
        emp.id.toLowerCase().includes(query) ||
        emp.department.toLowerCase().includes(query)
    );
    renderEmployeeTable(filtered);
}

// Edit employee
function editEmployee(id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;

    document.getElementById('modal-title').textContent = 'Edit Employee';
    document.getElementById('emp-id').value = emp.id;
    document.getElementById('emp-name').value = emp.name;
    document.getElementById('emp-dept').value = emp.department;
    document.getElementById('emp-position').value = emp.position;
    document.getElementById('emp-salary').value = emp.salary;
    document.getElementById('emp-join-date').value = emp.joinDate;
    document.getElementById('employee-modal').classList.add('show');
}

// Delete employee
function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee?')) {
        employees = employees.filter(e => e.id !== id);
        saveData();
        renderEmployeeTable();
        updateStats();
    }
}

// Handle form submit
function handleFormSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('emp-id').value;
    const employee = {
        id: id || generateId(),
        name: document.getElementById('emp-name').value,
        department: document.getElementById('emp-dept').value,
        position: document.getElementById('emp-position').value,
        salary: parseInt(document.getElementById('emp-salary').value),
        joinDate: document.getElementById('emp-join-date').value
    };

    if (id) {
        // Update existing
        const index = employees.findIndex(e => e.id === id);
        if (index !== -1) {
            employees[index] = employee;
        }
    } else {
        // Add new
        employees.push(employee);
    }

    saveData();
    closeModal();
    renderEmployeeTable();
    updateStats();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderEmployeeTable();
});
