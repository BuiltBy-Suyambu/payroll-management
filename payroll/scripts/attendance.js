// ===== Attendance Tracking =====

// Get current date for the date picker
function initializeAttendanceDate() {
    const dateInput = document.getElementById('attendance-date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
        renderAttendanceTable();
    }
}

// Render attendance table
function renderAttendanceTable() {
    const tbody = document.getElementById('attendance-table-body');
    const date = document.getElementById('attendance-date')?.value;
    const deptFilter = document.getElementById('attendance-dept')?.value || 'all';

    if (!tbody) return;

    const todayAttendance = attendanceData[date] || [];
    let filteredEmployees = employees;

    if (deptFilter !== 'all') {
        filteredEmployees = employees.filter(emp => emp.department === deptFilter);
    }

    tbody.innerHTML = filteredEmployees.map(emp => {
        const record = todayAttendance.find(a => a.empId === emp.id) || {
            empId: emp.id,
            status: 'present',
            checkIn: '',
            checkOut: ''
        };

        return `
            <tr>
                <td>${emp.id}</td>
                <td>${emp.name}</td>
                <td>${emp.department}</td>
                <td>
                    <select class="status-select ${getStatusClass(record.status)}"
                            onchange="updateAttendanceStatus('${emp.id}', '${date}', this.value, this)">
                        <option value="present" ${record.status === 'present' ? 'selected' : ''}>Present</option>
                        <option value="absent" ${record.status === 'absent' ? 'selected' : ''}>Absent</option>
                        <option value="late" ${record.status === 'late' ? 'selected' : ''}>Late</option>
                    </select>
                </td>
                <td>
                    <input type="time" value="${record.checkIn}"
                           onchange="updateAttendanceTime('${emp.id}', '${date}', 'checkIn', this.value)">
                </td>
                <td>
                    <input type="time" value="${record.checkOut}"
                           onchange="updateAttendanceTime('${emp.id}', '${date}', 'checkOut', this.value)">
                </td>
                <td>${calculateHours(record.checkIn, record.checkOut)}</td>
            </tr>
        `;
    }).join('');
}

// Get CSS class for status
function getStatusClass(status) {
    switch(status) {
        case 'present': return 'status-present';
        case 'absent': return 'status-absent';
        case 'late': return 'status-late';
        default: return '';
    }
}

// Calculate hours worked
function calculateHours(checkIn, checkOut) {
    if (!checkIn || !checkOut) return '-';

    const start = new Date(`2000-01-01T${checkIn}`);
    const end = new Date(`2000-01-01T${checkOut}`);
    const diff = (end - start) / (1000 * 60 * 60);

    if (diff < 0) return '-';
    return diff.toFixed(1) + ' hrs';
}

// Update attendance status
function updateAttendanceStatus(empId, date, status, selectEl) {
    if (!attendanceData[date]) {
        attendanceData[date] = [];
    }

    const record = attendanceData[date].find(a => a.empId === empId);
    if (record) {
        record.status = status;
    } else {
        attendanceData[date].push({
            empId,
            status,
            checkIn: '',
            checkOut: ''
        });
    }

    selectEl.className = `status-select ${getStatusClass(status)}`;
    saveData();
}

// Update attendance time
function updateAttendanceTime(empId, date, field, value) {
    if (!attendanceData[date]) {
        attendanceData[date] = [];
    }

    let record = attendanceData[date].find(a => a.empId === empId);
    if (record) {
        record[field] = value;
    } else {
        attendanceData[date].push({
            empId,
            status: 'present',
            checkIn: field === 'checkIn' ? value : '',
            checkOut: field === 'checkOut' ? value : ''
        });
    }

    saveData();
    renderAttendanceTable();
}

// Filter by department
function filterAttendance() {
    renderAttendanceTable();
}

// Mark all present
function markAllPresent() {
    const date = document.getElementById('attendance-date')?.value;
    if (!date) return;

    attendanceData[date] = employees.map(emp => ({
        empId: emp.id,
        status: 'present',
        checkIn: '09:00',
        checkOut: '18:00'
    }));

    saveData();
    renderAttendanceTable();
}

// Save attendance
function saveAttendance() {
    alert('Attendance saved successfully!');
    saveData();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeAttendanceDate();
});
