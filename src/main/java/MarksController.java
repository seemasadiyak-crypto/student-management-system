package student_management;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/marks")
@CrossOrigin(origins = "*")
public class MarksController {

    private final MarksRepository marksRepository;

    public MarksController(MarksRepository marksRepository) {
        this.marksRepository = marksRepository;
    }

    // GET MARKS
    @GetMapping("/{studentId}")
    public List<Marks> getMarks(@PathVariable int studentId) {
        return marksRepository.findByStudentId(studentId);
    }

    // SAVE MARKS
    @PostMapping
    public ResponseEntity<?> saveMarks(@RequestBody Marks marks) {

        if (marks.getStudentId() <= 0
                || marks.getSubject() == null
                || marks.getSubject().isBlank()
                || marks.getMarksObtained() < 0
                || marks.getMaxMarks() <= 0
                || marks.getMarksObtained() > marks.getMaxMarks()) {

            return ResponseEntity.badRequest()
                    .body("Invalid marks details");
        }

        Marks saved = marksRepository.save(marks);

        return ResponseEntity.ok(saved);
    }

    // DELETE MARKS
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMarks(@PathVariable int id) {

        if (!marksRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        marksRepository.deleteById(id);

        return ResponseEntity.ok("Marks deleted successfully");
    }
}