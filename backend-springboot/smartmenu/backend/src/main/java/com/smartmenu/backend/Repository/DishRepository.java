package com.smartmenu.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartmenu.backend.model.Dish;
import com.smartmenu.backend.model.Restaurant;

public interface DishRepository extends JpaRepository<Dish,Long> {
	
	
	List<Dish> findByRestaurant(Restaurant restaurant);
	
	
	

}
