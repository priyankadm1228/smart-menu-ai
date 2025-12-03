package com.smartmenu.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartmenu.backend.model.Restaurant;

public interface RestaurantRepository extends JpaRepository <Restaurant, Long>{
	

}
