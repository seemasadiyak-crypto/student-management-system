
/* =====================================
   STUDENT MANAGEMENT SYSTEM
===================================== */

// API URLS
const API_URL = "http://127.0.0.1:8080/api/students";
const ATTENDANCE_API = "http://127.0.0.1:8080/api/attendance";
const MARKS_API = "http://127.0.0.1:8080/api/marks";

// HTML ELEMENTS
const studentForm = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");

const searchInput = document.getElementById("searchInput");
const courseFilter = document.getElementById("courseFilter");

const totalStudents = document.getElementById("totalStudents");
const totalCourses = document.getElementById("totalCourses");

const attendanceDate = document.getElementById("attendanceDate");
const attendanceList = document.getElementById("attendanceList");
const presentCount = document.getElementById("presentCount");
const absentCount = document.getElementById("absentCount");
const attendancePercentage = document.getElementById("attendancePercentage");
const saveAttendance = document.getElementById("saveAttendance");

const marksForm = document.getElementById("marksForm");
const marksStudent = document.getElementById("marksStudentId");
const subjectName = document.getElementById("subject");
const obtainedMarks = document.getElementById("marksObtained");
const maximumMarks = document.getElementById("maxMarks");
const marksList = document.getElementById("marksList");

const applicationStatus = document.getElementById("applicationStatus");
const systemStatus = document.getElementById("systemStatus");

// APPLICATION DATA
let students = [];
let courseChart = null;
let marksChart = null;

let currentPage = 1;
const studentsPerPage = 5;


/* =====================================
   LOAD STUDENTS
===================================== */

async function loadStudents() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not load students");
        }

        students = await response.json();

        displayStudents();
        populateMarksStudentDropdown();

        await loadAttendance();

    } catch (error) {
        console.error("Student loading error:", error);

        if (studentList) {
            studentList.innerHTML =
                '<tr><td colspan="5">Unable to load student records.</td></tr>';
        }
    }
}


/* =====================================
   FILTER STUDENTS
===================================== */

function getFilteredStudents() {
    const searchValue = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    const selectedCourse = courseFilter
        ? courseFilter.value.toLowerCase()
        : "";

    return students
        .map((student, index) => ({ student, index }))
        .filter(item => {
            const student = item.student;

            const studentData =
                String(student.name || "") + " " +
                String(student.email || "") + " " +
                String(student.course || "");

            const matchesSearch =
                studentData.toLowerCase().includes(searchValue);

            const matchesCourse =
                !selectedCourse ||
                String(student.course || "").toLowerCase() === selectedCourse;

            return matchesSearch && matchesCourse;
        });
}


/* =====================================
   DISPLAY STUDENT RECORDS
===================================== */

function displayStudents() {
    if (!studentList) return;

    studentList.innerHTML = "";

    const filteredStudents = getFilteredStudents();

    const totalPages = Math.max(
        1,
        Math.ceil(filteredStudents.length / studentsPerPage)
    );

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * studentsPerPage;

    const pageStudents = filteredStudents.slice(
        startIndex,
        startIndex + studentsPerPage
    );

    if (pageStudents.length === 0) {
        studentList.innerHTML =
            '<tr><td colspan="5">No students found.</td></tr>';
    }

    pageStudents.forEach(function(item) {
        const student = item.student;
        const index = item.index;

        const row = document.createElement("tr");

        const photoCell = document.createElement("td");

        if (student.photo) {
            const image = document.createElement("img");
            image.src = student.photo;
            image.alt = "Student Photo";
            image.style.width = "40px";
            image.style.height = "40px";
            image.style.borderRadius = "50%";
            image.style.objectFit = "cover";
            photoCell.appendChild(image);
        } else {
            photoCell.textContent = "No Photo";
        }

        row.appendChild(photoCell);

        const nameCell = document.createElement("td");
        nameCell.textContent = student.name;
        row.appendChild(nameCell);

        const emailCell = document.createElement("td");
        emailCell.textContent = student.email;
        row.appendChild(emailCell);

        const courseCell = document.createElement("td");
        courseCell.textContent = student.course;
        row.appendChild(courseCell);

        const actionCell = document.createElement("td");

        const viewButton = document.createElement("button");
        viewButton.textContent = "View Profile";
        viewButton.type = "button";
        viewButton.dataset.action = "view";
        viewButton.dataset.index = index;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.type = "button";
        editButton.dataset.action = "edit";
        editButton.dataset.index = index;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.index = index;

        actionCell.append(viewButton, editButton, deleteButton);

        row.appendChild(actionCell);
        studentList.appendChild(row);
    });

    if (totalStudents) {
        totalStudents.textContent = students.length;
    }

    const uniqueCourses = new Set(
        students.map(student =>
            String(student.course || "").toLowerCase()
        )
    );

    if (totalCourses) {
        totalCourses.textContent = uniqueCourses.size;
    }

    updateCourseChart();
}


/* =====================================
   SEARCH AND COURSE FILTER
===================================== */

if (searchInput) {
    searchInput.addEventListener("input", function() {
        currentPage = 1;
        displayStudents();
    });
}

if (courseFilter) {
    courseFilter.addEventListener("change", function() {
        currentPage = 1;
        displayStudents();
    });
}


/* =====================================
   ADD STUDENT
===================================== */

if (studentForm) {
    studentForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("studentName").value.trim();
        const email = document.getElementById("studentEmail").value.trim();
        const course = document.getElementById("studentCourse").value.trim();

        const photoInput = document.getElementById("studentPhoto");
        let photo = "";

        if (photoInput && photoInput.files.length > 0) {
            const file = photoInput.files[0];

            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image.");
                return;
            }

            if (file.size > 1024 * 1024) {
                alert("Please select an image smaller than 1 MB.");
                return;
            }

            try {
                photo = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            } catch (error) {
                alert("Unable to read the selected image.");
                return;
            }
        }

        if (!/^[A-Za-z ]+$/.test(name)) {
            alert("Please enter a valid student name.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (!course) {
            alert("Please select a course.");
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    course,
                    photo
                })
            });

            if (!response.ok) {
                throw new Error("Could not add student");
            }

            studentForm.reset();
            currentPage = 1;

            await loadStudents();

            alert("Student added successfully!");

        } catch (error) {
            console.error("Add student error:", error);
            alert("Unable to add student. Please check the backend.");
        }
    });
}


/* =====================================
   VIEW, EDIT AND DELETE STUDENTS
===================================== */

if (studentList) {
    studentList.addEventListener("click", async function(event) {
        const button = event.target.closest("button");

        if (!button) return;

        const index = Number(button.dataset.index);
        const student = students[index];

        if (!student) return;

        try {
            if (button.dataset.action === "view") {
                const safe = function(value) {
                    return String(value ?? "")
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#39;");
                };

                const profileWindow = window.open(
                    "",
                    "_blank",
                    "width=450,height=600"
                );

                if (!profileWindow) {
                    alert("Please allow pop-ups to view the profile.");
                    return;
                }

                const photoHTML = student.photo
                    ? `<img id="profilePhoto"
                        src="${safe(student.photo)}"
                        alt="Student Photo"
                        style="width:130px;height:130px;
                        border-radius:50%;object-fit:cover;
                        cursor:zoom-in;">`
                    : "<p>No Photo Available</p>";

                profileWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Student Profile</title>
                    </head>
                    <body style="font-family:Arial;background:#f3f4f6;padding:25px;">
                        <div style="background:white;padding:30px;
                            border-radius:15px;max-width:350px;
                            margin:auto;text-align:center;">
                            <h2>Student Profile</h2>
                            ${photoHTML}
                            <p style="color:#666;">Click photo to view full size</p>
                            <h2>${safe(student.name)}</h2>
                            <p><b>Student ID:</b> ${safe(student.id)}</p>
                            <p><b>Email:</b> ${safe(student.email)}</p>
                            <p><b>Course:</b> ${safe(student.course)}</p>
                        </div>
                    </body>
                    </html>
                `);

                const profileImage =
                    profileWindow.document.getElementById("profilePhoto");

                if (profileImage) {
                    profileImage.addEventListener("click", function() {
                        const imageWindow = profileWindow.open(
                            "",
                            "_blank"
                        );

                        if (imageWindow) {
                            imageWindow.document.write(`
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <title>Original Student Photo</title>
                                </head>
                                <body style="margin:0;background:#111;
                                    display:flex;justify-content:center;
                                    align-items:center;min-height:100vh;">
                                    <img src="${safe(student.photo)}"
                                        style="max-width:100%;
                                        max-height:100vh;
                                        object-fit:contain;">
                                </body>
                                </html>
                            `);

                            imageWindow.document.close();
                        }
                    });
                }

                profileWindow.document.close();
            }

            if (button.dataset.action === "delete") {
                const confirmed = confirm(
                    "Are you sure you want to delete this student?"
                );

                if (!confirmed) return;

                const response = await fetch(
                    `${API_URL}/${student.id}`,
                    { method: "DELETE" }
                );

                if (!response.ok) {
                    throw new Error("Could not delete student");
                }

                await loadStudents();
                alert("Student deleted successfully!");
            }

            if (button.dataset.action === "edit") {
                const newName = prompt("Enter new name:", student.name);
                if (newName === null || !newName.trim()) return;

                const newEmail = prompt("Enter new email:", student.email);
                if (newEmail === null || !newEmail.trim()) return;

                const newCourse = prompt("Enter new course:", student.course);
                if (newCourse === null || !newCourse.trim()) return;

                if (!/^[A-Za-z ]+$/.test(newName.trim())) {
                    alert("Please enter a valid student name.");
                    return;
                }

                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
                    alert("Please enter a valid email address.");
                    return;
                }

                const response = await fetch(
                    `${API_URL}/${student.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            name: newName.trim(),
                            email: newEmail.trim(),
                            course: newCourse.trim(),
                            photo: student.photo || ""
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error("Could not update student");
                }

                await loadStudents();
                alert("Student updated successfully!");
            }

        } catch (error) {
            console.error("Student action error:", error);
            alert("Something went wrong. Please try again.");
        }
    });
}


/* =====================================
   COURSE ANALYTICS CHART
===================================== */

function updateCourseChart() {
    const canvas = document.getElementById("courseChart");

    if (!canvas || typeof Chart === "undefined") return;

    const courseCounts = {};

    students.forEach(function(student) {
        const course = student.course || "Other";
        courseCounts[course] = (courseCounts[course] || 0) + 1;
    });

    if (courseChart) courseChart.destroy();

    courseChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: Object.keys(courseCounts),
            datasets: [{
                label: "Number of Students",
                data: Object.values(courseCounts),
                backgroundColor: "#2563eb"
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}


/* =====================================
   ATTENDANCE MANAGEMENT
===================================== */

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

if (attendanceDate) {
    attendanceDate.value = getTodayDate();
}

async function loadAttendance() {
    if (!attendanceDate || !attendanceList) return;

    try {
        const response = await fetch(
            `${ATTENDANCE_API}?date=${attendanceDate.value}`
        );

        if (!response.ok) {
            throw new Error("Unable to load attendance");
        }

        const records = await response.json();
        displayAttendance(records);

    } catch (error) {
        console.error("Attendance loading error:", error);

        attendanceList.innerHTML =
            "<tr><td colspan='3'>Unable to load attendance.</td></tr>";
    }
}

function displayAttendance(records = []) {
    if (!attendanceList) return;

    attendanceList.innerHTML = "";

    students.forEach(function(student) {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = student.name;

        const courseCell = document.createElement("td");
        courseCell.textContent = student.course;

        const statusCell = document.createElement("td");

        const statusSelect = document.createElement("select");
        statusSelect.className = "attendance-status";
        statusSelect.dataset.studentId = student.id;

        statusSelect.innerHTML = `
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
        `;

        const existingRecord = records.find(
            record => Number(record.studentId) === Number(student.id)
        );

        if (existingRecord) {
            statusSelect.value = existingRecord.status;
        }

        statusSelect.addEventListener("change", updateAttendanceSummary);

        statusCell.appendChild(statusSelect);
        row.append(nameCell, courseCell, statusCell);
        attendanceList.appendChild(row);
    });

    updateAttendanceSummary();
}

function updateAttendanceSummary() {
    const selects = document.querySelectorAll(".attendance-status");

    let present = 0;
    let absent = 0;

    selects.forEach(function(select) {
        if (select.value === "Present") present++;
        else absent++;
    });

    const total = present + absent;

    if (presentCount) presentCount.textContent = present;
    if (absentCount) absentCount.textContent = absent;

    const percentage = total > 0 ? (present / total) * 100 : 0;

    if (attendancePercentage) {
        attendancePercentage.textContent = percentage.toFixed(1) + "%";
    }
}

if (attendanceDate) {
    attendanceDate.addEventListener("change", loadAttendance);
}

if (saveAttendance) {
    saveAttendance.addEventListener("click", async function() {
        const selects = document.querySelectorAll(".attendance-status");

        if (selects.length === 0) {
            alert("No students available for attendance.");
            return;
        }

        const attendanceRecords = Array.from(selects).map(function(select) {
            return {
                studentId: Number(select.dataset.studentId),
                attendanceDate: attendanceDate.value,
                status: select.value
            };
        });

        try {
            saveAttendance.disabled = true;

            const responses = await Promise.all(
                attendanceRecords.map(function(record) {
                    return fetch(ATTENDANCE_API, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(record)
                    });
                })
            );

            if (responses.some(response => !response.ok)) {
                throw new Error("Unable to save attendance");
            }

            alert("Attendance saved successfully!");
            await loadAttendance();

        } catch (error) {
            console.error("Attendance saving error:", error);
            alert("Unable to save attendance. Please check backend.");

        } finally {
            saveAttendance.disabled = false;
        }
    });
}


/* =====================================
   EXAMINATION AND RESULTS
===================================== */

// STUDENT ID SUGGESTIONS
function populateMarksStudentDropdown() {
    if (!marksStudent) return;

    marksStudent.setAttribute("list", "studentIdOptions");

    let dataList = document.getElementById("studentIdOptions");

    if (!dataList) {
        dataList = document.createElement("datalist");
        dataList.id = "studentIdOptions";
        marksStudent.insertAdjacentElement("afterend", dataList);
    }

    dataList.innerHTML = "";

    students.forEach(function(student) {
        const option = document.createElement("option");
        option.value = student.id;
        option.label = student.name;
        dataList.appendChild(option);
    });
}


// LOAD MARKS
async function loadStudentMarks() {
    if (!marksStudent || !marksList) return;

    const studentId = marksStudent.value.trim();

    if (!studentId) {
        marksList.innerHTML =
            '<tr><td colspan="6">Please select a student to view results.</td></tr>';

        updateMarksSummary([]);
        updateMarksChart([]);
        return;
    }

    const selectedStudent = students.find(
        student => String(student.id) === String(studentId)
    );

    if (!selectedStudent) {
        marksList.innerHTML =
            '<tr><td colspan="6">Student ID not found. Please enter a valid ID.</td></tr>';

        updateMarksSummary([]);
        updateMarksChart([]);
        return;
    }

    try {
        const response = await fetch(`${MARKS_API}/${studentId}`);

        if (!response.ok) {
            throw new Error("Unable to load marks");
        }

        const records = await response.json();
        displayStudentMarks(records, selectedStudent);

    } catch (error) {
        console.error("Marks loading error:", error);

        marksList.innerHTML =
            '<tr><td colspan="6">Unable to load results.</td></tr>';
    }
}


// DISPLAY RESULTS TABLE
function displayStudentMarks(records, selectedStudent) {
    if (!marksList) return;

    marksList.innerHTML = "";

    if (!records || records.length === 0) {
        marksList.innerHTML =
            '<tr><td colspan="6">No examination marks available for this student.</td></tr>';

        updateMarksSummary([]);
        updateMarksChart([]);
        return;
    }

    records.forEach(function(record) {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = selectedStudent.id;

        const nameCell = document.createElement("td");
        nameCell.textContent = selectedStudent.name;

        const subjectCell = document.createElement("td");
        subjectCell.textContent = record.subject || "-";

        const obtainedCell = document.createElement("td");
        obtainedCell.textContent = record.marksObtained;

        const maximumCell = document.createElement("td");
        maximumCell.textContent = record.maxMarks;

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.dataset.action = "edit-mark";
        editButton.dataset.id = record.id;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.dataset.action = "delete-mark";
        deleteButton.dataset.id = record.id;

        actionCell.append(editButton, deleteButton);

        row.append(
            idCell,
            nameCell,
            subjectCell,
            obtainedCell,
            maximumCell,
            actionCell
        );

        marksList.appendChild(row);
    });

    updateMarksSummary(records);
    updateMarksChart(records);
}


// UPDATE SUMMARY CARDS
function updateMarksSummary(records) {
    const totalExams = document.getElementById("totalExams");
    const averageMarks = document.getElementById("averageMarks");
    const passPercentage = document.getElementById("passPercentage");

    const average = records.length > 0
        ? records.reduce(
            (sum, record) => sum + Number(record.marksObtained),
            0
        ) / records.length
        : 0;

    const passed = records.filter(function(record) {
        const maximum = Number(record.maxMarks);
        const obtained = Number(record.marksObtained);

        return maximum > 0 && (obtained / maximum) * 100 >= 40;
    }).length;

    const passRate = records.length > 0
        ? (passed / records.length) * 100
        : 0;

    if (totalExams) totalExams.textContent = records.length;
    if (averageMarks) averageMarks.textContent = average.toFixed(1);
    if (passPercentage) {
        passPercentage.textContent = passRate.toFixed(1) + "%";
    }
}


// MARKS CHART
function updateMarksChart(records) {
    const canvas = document.getElementById("marksChart");

    if (!canvas || typeof Chart === "undefined") return;

    if (marksChart) marksChart.destroy();

    const subjects = records.map(record => record.subject);

    const percentages = records.map(function(record) {
        const maximum = Number(record.maxMarks);

        return maximum > 0
            ? Number(
                (Number(record.marksObtained) / maximum * 100).toFixed(1)
            )
            : 0;
    });

    marksChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: subjects,
            datasets: [{
                label: "Student Performance (%)",
                data: percentages,
                backgroundColor: "#4f46e5",
                borderRadius: 7
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: "Percentage (%)"
                    }
                }
            }
        }
    });
}


// STUDENT ID CHANGE
if (marksStudent) {
    marksStudent.addEventListener("change", loadStudentMarks);
}


/* =====================================
   SAVE EXAMINATION MARKS
===================================== */

if (marksForm) {
    marksForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const studentId = Number(marksStudent.value);
        const subject = subjectName.value.trim();
        const obtained = Number(obtainedMarks.value);
        const maximum = Number(maximumMarks.value);

        const selectedStudent = students.find(
            student => Number(student.id) === studentId
        );

        if (!selectedStudent) {
            alert("Please enter a valid Student ID.");
            return;
        }

        if (!subject) {
            alert("Please enter a subject.");
            return;
        }

        if (
            obtainedMarks.value.trim() === "" ||
            maximumMarks.value.trim() === "" ||
            !Number.isFinite(obtained) ||
            !Number.isFinite(maximum) ||
            obtained < 0 ||
            maximum <= 0 ||
            obtained > maximum
        ) {
            alert("Please enter valid marks.");
            return;
        }

        const marksData = {
            studentId: studentId,
            subject: subject,
            marksObtained: obtained,
            maxMarks: maximum
        };

        const submitButton = marksForm.querySelector(
            'button[type="submit"]'
        );

        try {
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Saving...";
            }

            const response = await fetch(MARKS_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(marksData)
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            alert("Examination marks saved successfully!");

            subjectName.value = "";
            obtainedMarks.value = "";
            maximumMarks.value = "";

            await loadStudentMarks();

        } catch (error) {
            console.error("Saving marks error:", error);
            alert("Unable to save marks. Please check backend.");

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Save Marks";
            }
        }
    });
}


/* =====================================
   EDIT AND DELETE MARKS
===================================== */

if (marksList) {
    marksList.addEventListener("click", async function(event) {
        const button = event.target.closest("button");

        if (!button) return;

        const markId = button.dataset.id;
        const action = button.dataset.action;

        if (!markId) return;

        try {
            if (action === "delete-mark") {
                const confirmed = confirm(
                    "Are you sure you want to delete these marks?"
                );

                if (!confirmed) return;

                const response = await fetch(
                    `${MARKS_API}/${markId}`,
                    { method: "DELETE" }
                );

                if (!response.ok) {
                    throw new Error("Unable to delete marks");
                }

                alert("Marks deleted successfully!");
                await loadStudentMarks();
            }

            if (action === "edit-mark") {
                const studentId = marksStudent.value;

                const response = await fetch(`${MARKS_API}/${studentId}`);

                if (!response.ok) {
                    throw new Error("Unable to load marks");
                }

                const records = await response.json();

                const record = records.find(
                    item => String(item.id) === String(markId)
                );

                if (!record) return;

                const newSubject = prompt(
                    "Enter subject:",
                    record.subject
                );

                if (newSubject === null || !newSubject.trim()) return;

                const obtainedInput = prompt(
                    "Enter obtained marks:",
                    record.marksObtained
                );

                if (obtainedInput === null || obtainedInput.trim() === "") return;

                const maximumInput = prompt(
                    "Enter maximum marks:",
                    record.maxMarks
                );

                if (maximumInput === null || maximumInput.trim() === "") return;

                const newObtained = Number(obtainedInput);
                const newMaximum = Number(maximumInput);

                if (
                    !Number.isFinite(newObtained) ||
                    !Number.isFinite(newMaximum) ||
                    newObtained < 0 ||
                    newMaximum <= 0 ||
                    newObtained > newMaximum
                ) {
                    alert("Please enter valid marks.");
                    return;
                }

                const updateResponse = await fetch(
                    `${MARKS_API}/${markId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            studentId: Number(studentId),
                            subject: newSubject.trim(),
                            marksObtained: newObtained,
                            maxMarks: newMaximum
                        })
                    }
                );

                if (!updateResponse.ok) {
                    throw new Error("Unable to update marks");
                }

                alert("Marks updated successfully!");
                await loadStudentMarks();
            }

        } catch (error) {
            console.error("Marks action error:", error);
            alert("Unable to complete this action. Check the backend.");
        }
    });
}


/* =====================================
   APPLICATION STATUS
===================================== */

async function checkSystemStatus() {
    if (!applicationStatus || !systemStatus) return;

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Backend unavailable");
        }

        applicationStatus.textContent = "Active";
        systemStatus.textContent = "Backend Connected";

    } catch (error) {
        applicationStatus.textContent = "Offline";
        systemStatus.textContent = "Backend Disconnected";
    }
}


/* =====================================
   START APPLICATION
===================================== */

loadStudents();
checkSystemStatus();
