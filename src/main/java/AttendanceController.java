
package student_management;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;

    public AttendanceController(
            AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    // Get attendance for a selected date
    @GetMapping
    public List<Attendance> getAttendance(
            @RequestParam LocalDate date) {

        return attendanceRepository.findByAttendanceDate(date);
    }

    // Save or update student attendance
    @PostMapping
    public ResponseEntity<?> saveAttendance(
            @RequestBody Attendance attendance) {

        if (attendance.getStudentId() <= 0
                || attendance.getAttendanceDate() == null
                || attendance.getStatus() == null) {
            return ResponseEntity.badRequest()
                    .body("Invalid attendance details");
        }

        if (!attendance.getStatus().equals("Present")
                && !attendance.getStatus().equals("Absent")) {
            return ResponseEntity.badRequest()
                    .body("Status must be Present or Absent");
        }

        Attendance record = attendanceRepository
                .findByStudentIdAndAttendanceDate(
                        attendance.getStudentId(),
                        attendance.getAttendanceDate())
                .orElse(new Attendance());

        record.setStudentId(attendance.getStudentId());
        record.setAttendanceDate(attendance.getAttendanceDate());
        record.setStatus(attendance.getStatus());

        Attendance saved = attendanceRepository.save(record);

        return ResponseEntity.ok(saved);
    }
}
