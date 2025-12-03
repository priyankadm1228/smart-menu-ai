package com.smartmenu.backend.Controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.smartmenu.backend.Repository.DishRepository;
import com.smartmenu.backend.Repository.RestaurantRepository;
import com.smartmenu.backend.model.Dish;
import com.smartmenu.backend.model.Restaurant;

import jakarta.validation.Valid;


@RestController
@RequestMapping("api/restaurants/{restaurantId}/dishes")
public class DishController {
	
	private DishRepository dishrepository;
	private RestaurantRepository  restaurantrepository ;
	
	public DishController(DishRepository dishrepository,RestaurantRepository RestaurantRepository)
	{
		this. dishrepository = dishrepository;
		this.restaurantrepository = RestaurantRepository;
	}
	
	private Restaurant getrestaurantOrThrow(Long restaurantId)
	{
		return restaurantrepository.findById(restaurantId)
				.orElseThrow(()-> new RuntimeException("Restaurant not found: " + restaurantId));
		
		
	}
	
	@GetMapping
	 public List<Dish> getdishes(@PathVariable Long restaurantId)
	 {
	Restaurant restaurant =  getrestaurantOrThrow(restaurantId);
	
	return  dishrepository.findByRestaurant(restaurant);
	
	
	
	 }
	
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Dish newDish(@PathVariable Long restaurantId, @Valid @RequestBody Dish dish)
	{
		Restaurant restaurant = getrestaurantOrThrow(restaurantId);
		dish.setRestaurant(restaurant);
	    return dishrepository.save(dish);	
	}
	
	
	@PutMapping("/{dishId}")
	public Dish updateDish(@PathVariable Long restaurantId,@PathVariable Long dishId,@Valid @RequestBody Dish dish)
	{
		 Restaurant restaurant = getrestaurantOrThrow(restaurantId);
		 
		 Dish exists = dishrepository.findById(dishId)
				 .orElseThrow(()-> new RuntimeException("Dish not found:"+ dishId));
		 
		 if(!exists.getRestaurant().getId().equals(restaurant.getId()))
		 {
			throw new RuntimeException("Dish does not belong to restaurant" + restaurantId) ;
		 }
		 
		 exists.setName(dish.getName());
		 exists.setCategory(dish.getCategory());
		 exists.setPrice(dish.getPrice());
		 
		 return dishrepository.save(exists); 
	}
	
	
	@DeleteMapping("/{dishId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteDish(@PathVariable Long restaurantId, @PathVariable Long dishId)
	{
	  
		Restaurant restaurant = getrestaurantOrThrow(restaurantId);
		Dish exists = dishrepository.findById(dishId) 
				.orElseThrow(() -> new RuntimeException("Dish not found: " + dishId));
		
		if(!exists.getRestaurant().getId().equals(restaurant.getId()))
		{
			 throw new RuntimeException("Dish does not belong to restaurant " + restaurantId);
		}
		
		
		
		dishrepository.delete(exists);
		
	}
		
	}
	

	


