package com.college.productdev.csrmodule;

import com.college.productdev.csrmodule.assignments.EmployeeProject;
import com.college.productdev.csrmodule.assignments.EmployeeProjectRepository;
import com.college.productdev.csrmodule.bookings.Booking;
import com.college.productdev.csrmodule.bookings.BookingRepository;
import com.college.productdev.csrmodule.projects.Project;
import com.college.productdev.csrmodule.projects.ProjectRepository;
import com.college.productdev.csrmodule.users.User;
import com.college.productdev.csrmodule.users.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final BookingRepository bookingRepository;
    private final EmployeeProjectRepository assignmentRepository;

    public DataLoader(UserRepository userRepository, ProjectRepository projectRepository,
                      BookingRepository bookingRepository, EmployeeProjectRepository assignmentRepository) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.bookingRepository = bookingRepository;
        this.assignmentRepository = assignmentRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Only seed data if the database is empty
        if (userRepository.count() > 0) {
            System.out.println("Database already seeded.");
            return;
        }

        System.out.println("Seeding database with initial data...");

        // 1. Create Admin
        User admin = new User();
        admin.setName("Prabhu Admin");
        admin.setEmail("prabhu@admin.com");
        admin.setUsername("prabhu");
        admin.setPassword("1234");
        admin.setRole("Admin");
        admin.setVerifiedAt(LocalDateTime.now());
        admin = userRepository.save(admin);

        // 2. Create Employees
        User emp1 = new User(); emp1.setName("Alice Johnson"); emp1.setEmail("alice@corp.com"); emp1.setUsername("alice"); emp1.setRole("Employee"); emp1.setDepartment("Environment"); emp1.setProfession("Environment"); emp1 = saveUser(emp1);
        User emp2 = new User(); emp2.setName("Bob Singh"); emp2.setEmail("bob@corp.com"); emp2.setUsername("bob"); emp2.setRole("Employee"); emp2.setDepartment("Education"); emp2.setProfession("Education"); emp2 = saveUser(emp2);
        User emp3 = new User(); emp3.setName("Chitra Rao"); emp3.setEmail("chitra@corp.com"); emp3.setUsername("chitra"); emp3.setRole("Employee"); emp3.setDepartment("Healthcare"); emp3.setProfession("Healthcare"); emp3 = saveUser(emp3);
        User emp4 = new User(); emp4.setName("Daniel Kim"); emp4.setEmail("daniel@corp.com"); emp4.setUsername("daniel"); emp4.setRole("Employee"); emp4.setDepartment("Environment"); emp4.setProfession("Environment"); emp4 = saveUser(emp4);
        User emp5 = new User(); emp5.setName("Eva Lopez"); emp5.setEmail("eva@corp.com"); emp5.setUsername("eva"); emp5.setRole("Employee"); emp5.setDepartment("Education"); emp5.setProfession("Education"); emp5 = saveUser(emp5);

        // 3. Create Volunteer
        User vol6 = new User(); vol6.setName("John Volunteer"); vol6.setEmail("volunteer@csr.com"); vol6.setUsername("john"); vol6.setRole("Volunteer"); vol6.setDepartment("Education"); vol6.setProfession("Education"); vol6 = saveUser(vol6);

        // 4. Create Projects
        Project p1 = new Project(); p1.setProjectName("Tree Plantation Drive"); p1.setDepartment("Environment"); p1.setBudget(500000L); p1.setUsedBudget(120000L); p1.setStartDate("2025-01-10"); p1.setEndDate("2025-12-20"); p1.setStatus("Ongoing"); p1.setDescription("City-wide plantation of saplings."); p1.setLocation("City Park"); p1.setLatitude(19.0760); p1.setLongitude(72.8777); p1.setSeats(25); p1 = projectRepository.save(p1);
        Project p2 = new Project(); p2.setProjectName("School Education Program"); p2.setDepartment("Education"); p2.setBudget(800000L); p2.setUsedBudget(300000L); p2.setStartDate("2025-02-01"); p2.setEndDate("2025-10-30"); p2.setStatus("Planned"); p2.setDescription("After-school coaching for underserved communities."); p2.setLocation("Community School"); p2.setLatitude(28.6139); p2.setLongitude(77.2090); p2.setSeats(10); p2 = projectRepository.save(p2);
        Project p3 = new Project(); p3.setProjectName("Health Camp"); p3.setDepartment("Healthcare"); p3.setBudget(300000L); p3.setUsedBudget(50000L); p3.setStartDate("2025-03-15"); p3.setEndDate("2025-07-15"); p3.setStatus("Completed"); p3.setDescription("Free medical checkups and medicines."); p3.setLocation("Town Hall"); p3.setLatitude(13.0827); p3.setLongitude(80.2707); p3.setSeats(0); p3 = projectRepository.save(p3);

        // 5. Assignments
        assignmentRepository.save(new EmployeeProject(emp1.getId(), p1.getId()));
        assignmentRepository.save(new EmployeeProject(emp2.getId(), p2.getId()));
        assignmentRepository.save(new EmployeeProject(emp3.getId(), p3.getId()));

        // 6. Create Initial Booking
        Booking b1 = new Booking();
        b1.setId(UUID.randomUUID().toString());
        b1.setEventId(p1.getId());
        b1.setUserId(emp4.getId());
        b1.setName(emp4.getName());
        b1.setEmail(emp4.getEmail());
        b1.setProfession(emp4.getProfession());
        b1.setStatus("Pending");
        b1.setBookingType("Project");
        bookingRepository.save(b1);

        Booking b2 = new Booking();
        b2.setId(UUID.randomUUID().toString());
        b2.setEventId(p2.getId());
        b2.setUserId(emp5.getId());
        b2.setName(emp5.getName());
        b2.setEmail(emp5.getEmail());
        b2.setProfession(emp5.getProfession());
        b2.setStatus("Approved");
        b2.setBookingType("Project");
        bookingRepository.save(b2);

        System.out.println("Successfully seeded database.");
    }

    private User saveUser(User u) {
        u.setPassword("password"); // Default password for employee/volunteer logins
        u.setVerifiedAt(LocalDateTime.now());
        return userRepository.save(u);
    }
}
