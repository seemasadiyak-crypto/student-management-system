
package student_management;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository
        extends JpaRepository<Attendance, Integer> {

    List<Attendance> findByAttendanceDate(LocalDate attendanceDate);

    Optional<Attendance> findByStudentIdAndAttendanceDate(
            int studentId, LocalDate attendanceDate);
}
