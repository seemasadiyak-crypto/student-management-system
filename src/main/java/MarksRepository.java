
package student_management;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MarksRepository extends JpaRepository<Marks, Integer> {

    List<Marks> findByStudentId(int studentId);
}
