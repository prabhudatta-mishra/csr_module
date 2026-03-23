package com.college.productdev.csrmodule.bookings;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByEmail(String email);
}
