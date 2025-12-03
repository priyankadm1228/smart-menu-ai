document.addEventListener("DOMContentLoaded", function () {
    var API_BASE = "http://localhost:8080/api";
  
    // Restaurant elements
    var loadBtn = document.getElementById("load-btn");
    var loadBtn = document.getElementById("load-btn");
    var listEl = document.getElementById("restaurants-list");
    var debugEl = document.getElementById("debug");
    var searchInput = document.getElementById("restaurant-search");
    
    // keep full list in memory for filtering
    var allRestaurants = [];
  
    var form = document.getElementById("restaurant-form");
    var nameInput = document.getElementById("restaurant-name");
    var locationInput = document.getElementById("restaurant-location");
  
    // Dish elements
    var dishesTitleEl = document.getElementById("dishes-title");
    var dishesListEl = document.getElementById("dishes-list");
    var dishFormWrapper = document.getElementById("dish-form-wrapper");
    var dishForm = document.getElementById("dish-form");
    var dishNameInput = document.getElementById("dish-name");
    var dishPriceInput = document.getElementById("dish-price");
    var dishDescriptionInput = document.getElementById("dish-description");
  
    // Keep track of which restaurant is selected
    var selectedRestaurantId = null;
    var selectedRestaurantName = null;
  
    loadBtn.addEventListener("click", loadRestaurants);
    form.addEventListener("submit", handleCreateRestaurant);
    dishForm.addEventListener("submit", handleCreateDish);
    searchInput.addEventListener("input", function () {
        renderRestaurants();
      });
      
  
    // --- GET /api/restaurants ---
    async function loadRestaurants() {
      debugEl.textContent = "Calling backend (GET /restaurants)...";
  
      try {
        var res = await fetch(API_BASE + "/restaurants");
        var text = await res.text();
  
        debugEl.textContent =
          "Status: " + res.status + "\n\n" +
          "Raw response:\n" + text;
  
        if (!res.ok) {
          return;
        }
  
        var data = JSON.parse(text);

        // store in memory
        allRestaurants = data;
        
        // render based on current search text
        renderRestaurants();

        function renderRestaurants() {
            // clear current list
            listEl.innerHTML = "";
          
            if (!allRestaurants || allRestaurants.length === 0) {
              var emptyItem = document.createElement("li");
              emptyItem.textContent = "No restaurants found.";
              listEl.appendChild(emptyItem);
              return;
            }
          
            var filter = searchInput.value.trim().toLowerCase();
          
            // filter by name or location
            var filtered = allRestaurants.filter(function (restaurant) {
              if (!filter) return true;
              var text =
                (restaurant.name || "").toLowerCase() +
                " " +
                (restaurant.location || "").toLowerCase();
              return text.includes(filter);
            });
          
            if (filtered.length === 0) {
              var noMatch = document.createElement("li");
              noMatch.textContent = "No restaurants match your search.";
              listEl.appendChild(noMatch);
              return;
            }
          
            filtered.forEach(function (restaurant) {
              var li = document.createElement("li");
              li.style.cursor = "pointer";
          
              var infoSpan = document.createElement("span");
              infoSpan.textContent = restaurant.name + " (" + restaurant.location + ")";
              li.appendChild(infoSpan);
          
              // --- Edit button (reuse your existing code) ---
              var editBtn = document.createElement("button");
              editBtn.textContent = "Edit";
              editBtn.className = "small-btn edit-btn";
              editBtn.addEventListener("click", function (event) {
                event.stopPropagation();
                var newName = prompt("Enter new name:", restaurant.name);
                if (!newName) return;
          
                var newLocation = prompt("Enter new location:", restaurant.location);
                if (!newLocation) return;
          
                updateRestaurant(restaurant.id, newName.trim(), newLocation.trim());
              });
              li.appendChild(editBtn);
          
              // --- Delete button (reuse existing code) ---
              var deleteBtn = document.createElement("button");
              deleteBtn.textContent = "Delete";
              deleteBtn.className = "small-btn delete-btn";
              deleteBtn.addEventListener("click", function (event) {
                event.stopPropagation();
                var ok = confirm(
                  "Are you sure you want to delete restaurant '" +
                    restaurant.name +
                    "'?"
                );
                if (!ok) return;
                deleteRestaurant(restaurant.id);
              });
              li.appendChild(deleteBtn);
          
              // Click to select restaurant
              li.addEventListener("click", function () {
                document
                  .querySelectorAll("#restaurants-list li")
                  .forEach(function (item) {
                    item.classList.remove("selected");
                  });
          
                li.classList.add("selected");
          
                selectedRestaurantId = restaurant.id;
                selectedRestaurantName = restaurant.name;
          
                dishesTitleEl.textContent = "Dishes for: " + selectedRestaurantName;
                dishFormWrapper.style.display = "block";
          
                loadDishesForRestaurant(selectedRestaurantId);
              });
          
              listEl.appendChild(li);
            });
          }
          
  
        // Clear restaurant list
        listEl.innerHTML = "";
  
        if (data.length === 0) {
          var emptyItem = document.createElement("li");
          emptyItem.textContent = "No restaurants found.";
          listEl.appendChild(emptyItem);
          return;
        }
  
        data.forEach(function (restaurant) {
          var li = document.createElement("li");
          li.style.cursor = "pointer";
  
          // Main text span
          var infoSpan = document.createElement("span");
          infoSpan.textContent = restaurant.name + " (" + restaurant.location + ")";
          li.appendChild(infoSpan);
  
          // --- Edit button (restaurant) ---
          var editBtn = document.createElement("button");
          editBtn.textContent = "Edit";
          editBtn.className = "small-btn edit-btn";
          editBtn.addEventListener("click", function (event) {
            event.stopPropagation();
  
            var newName = prompt("Enter new name:", restaurant.name);
            if (!newName) return;
  
            var newLocation = prompt("Enter new location:", restaurant.location);
            if (!newLocation) return;
  
            updateRestaurant(restaurant.id, newName.trim(), newLocation.trim());
          });
          li.appendChild(editBtn);
  
          // --- Delete button (restaurant) ---
          var deleteBtn = document.createElement("button");
          deleteBtn.textContent = "Delete";
          deleteBtn.className = "small-btn delete-btn";
          deleteBtn.addEventListener("click", function (event) {
            event.stopPropagation();
  
            var ok = confirm(
              "Are you sure you want to delete restaurant '" +
                restaurant.name +
                "'?"
            );
            if (!ok) return;
  
            deleteRestaurant(restaurant.id);
          });
          li.appendChild(deleteBtn);
  
          // Click restaurant to select + load dishes
          li.addEventListener("click", function () {
            document
              .querySelectorAll("#restaurants-list li")
              .forEach(function (item) {
                item.classList.remove("selected");
              });
  
            li.classList.add("selected");
  
            selectedRestaurantId = restaurant.id;
            selectedRestaurantName = restaurant.name;
  
            dishesTitleEl.textContent = "Dishes for: " + selectedRestaurantName;
            dishFormWrapper.style.display = "block";
  
            loadDishesForRestaurant(selectedRestaurantId);
          });
  
          listEl.appendChild(li);
        });
  
      } catch (err) {
        console.error(err);
        debugEl.textContent = "Error: " + err.message;
      }
    }
  
    // --- POST /api/restaurants ---
    async function handleCreateRestaurant(event) {
      event.preventDefault();
  
      var name = nameInput.value.trim();
      var location = locationInput.value.trim();
  
      if (!name || !location) {
        alert("Please enter both name and location.");
        return;
      }
  
      var body = {
        name: name,
        location: location
      };
  
      debugEl.textContent = "Calling backend (POST /restaurants)...";
  
      try {
        var res = await fetch(API_BASE + "/restaurants", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });
  
        var text = await res.text();
  
        debugEl.textContent =
          "Status: " + res.status + "\n\n" +
          "Raw response:\n" + text;
  
        if (!res.ok) {
          alert("Failed to create restaurant.");
          return;
        }
  
        form.reset();
        loadRestaurants();
  
      } catch (err) {
        console.error(err);
        debugEl.textContent = "Error: " + err.message;
      }
    }
  
    // --- PUT /api/restaurants/{id} ---
    async function updateRestaurant(id, newName, newLocation) {
      debugEl.textContent =
        "Calling backend (PUT /restaurants/" + id + ")...";
  
      var body = {
        name: newName,
        location: newLocation
      };
  
      try {
        var res = await fetch(API_BASE + "/restaurants/" + id, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });
  
        var text = await res.text();
  
        debugEl.textContent =
          "Status: " + res.status + "\n\n" +
          "Raw response:\n" + text;
  
        if (!res.ok) {
          alert("Failed to update restaurant.");
          return;
        }
  
        loadRestaurants();
  
      } catch (err) {
        console.error(err);
        debugEl.textContent = "Error: " + err.message;
      }
    }
  
    // --- DELETE /api/restaurants/{id} ---
    async function deleteRestaurant(id) {
      debugEl.textContent =
        "Calling backend (DELETE /restaurants/" + id + ")...";
  
      try {
        var res = await fetch(API_BASE + "/restaurants/" + id, {
          method: "DELETE"
        });
  
        debugEl.textContent = "Status: " + res.status;
  
        if (!res.ok) {
          alert("Failed to delete restaurant.");
          return;
        }
  
        if (selectedRestaurantId === id) {
          selectedRestaurantId = null;
          selectedRestaurantName = null;
          dishesTitleEl.textContent = "Dishes (select a restaurant)";
          dishesListEl.innerHTML = "";
          dishFormWrapper.style.display = "none";
        }
  
        loadRestaurants();
  
      } catch (err) {
        console.error(err);
        debugEl.textContent = "Error: " + err.message;
      }
    }
  
    // --- GET /api/restaurants/{id}/dishes ---
    async function loadDishesForRestaurant(restaurantId) {
      debugEl.textContent =
        "Calling backend (GET /restaurants/" + restaurantId + "/dishes)...";
  
      try {
        var res = await fetch(
          API_BASE + "/restaurants/" + restaurantId + "/dishes"
        );
        var text = await res.text();
  
        debugEl.textContent =
          "Status: " + res.status + "\n\n" +
          "Raw response:\n" + text;
  
        dishesListEl.innerHTML = "";
  
        if (!res.ok) {
          var errorItem = document.createElement("li");
          errorItem.textContent = "Failed to load dishes.";
          dishesListEl.appendChild(errorItem);
          return;
        }
  
        var data = JSON.parse(text);
  
        if (data.length === 0) {
          var emptyItem = document.createElement("li");
          emptyItem.textContent = "No dishes found for this restaurant.";
          dishesListEl.appendChild(emptyItem);
          return;
        }
  
        data.forEach(function (dish) {
          var li = document.createElement("li");
  
          var textSpan = document.createElement("span");
          var priceText = dish.price != null ? " - $" + dish.price : "";
          textSpan.textContent = dish.name + priceText;
          if (dish.description) {
            textSpan.textContent += " (" + dish.description + ")";
          }
          li.appendChild(textSpan);
  
          // --- Edit button (dish) ---
          var editDishBtn = document.createElement("button");
          editDishBtn.textContent = "Edit";
          editDishBtn.className = "small-btn edit-btn";
          editDishBtn.addEventListener("click", function () {
            var newName = prompt("New dish name:", dish.name);
            if (!newName) return;
  
            var newPriceStr = prompt(
              "New price:",
              dish.price != null ? dish.price : ""
            );
            if (!newPriceStr) return;
            var newPrice = parseFloat(newPriceStr);
            if (isNaN(newPrice)) {
              alert("Invalid price.");
              return;
            }
  
            var newDesc = prompt(
              "New description:",
              dish.description ? dish.description : ""
            );
            if (newDesc === null) return;
  
            updateDish(dish.id, newName.trim(), newPrice, newDesc.trim());
          });
          li.appendChild(editDishBtn);
  
          // --- Delete button (dish) ---
          var deleteDishBtn = document.createElement("button");
          deleteDishBtn.textContent = "Delete";
          deleteDishBtn.className = "small-btn delete-btn";
          deleteDishBtn.addEventListener("click", function () {
            var ok = confirm(
              "Delete dish '" + dish.name + "'?"
            );
            if (!ok) return;
  
            deleteDish(dish.id);
          });
          li.appendChild(deleteDishBtn);
  
          dishesListEl.appendChild(li);
        });
  
      } catch (err) {
        console.error(err);
        debugEl.textContent = "Error: " + err.message;
      }
    }
  
    // --- PUT /api/restaurants/{restaurantId}/dishes/{dishId} ---
    async function updateDish(dishId, newName, newPrice, newDescription) {
      if (!selectedRestaurantId) {
        alert("No restaurant selected.");
        return;
      }
  
      debugEl.textContent =
        "Calling backend (PUT /restaurants/" +
        selectedRestaurantId +
        "/dishes/" +
        dishId +
        ")...";
  
      var body = {
        name: newName,
        price: newPrice,
        description: newDescription
      };
  
      try {
        var res = await fetch(
          API_BASE +
            "/restaurants/" +
            selectedRestaurantId +
            "/dishes/" +
            dishId,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
          }
        );
  
        var text = await res.text();
  
        debugEl.textContent =
          "Status: " + res.status + "\n\n" +
          "Raw response:\n" + text;
  
        if (!res.ok) {
          alert("Failed to update dish.");
          return;
        }
  
        loadDishesForRestaurant(selectedRestaurantId);
  
      } catch (err) {
        console.error(err);
        debugEl.textContent = "Error: " + err.message;
      }
    }
  
    // --- DELETE /api/restaurants/{restaurantId}/dishes/{dishId} ---
    async function deleteDish(dishId) {
      if (!selectedRestaurantId) {
        alert("No restaurant selected.");
        return;
      }
  
      debugEl.textContent =
        "Calling backend (DELETE /restaurants/" +
        selectedRestaurantId +
        "/dishes/" +
        dishId +
        ")...";
  
      try {
        var res = await fetch(
          API_BASE +
            "/restaurants/" +
            selectedRestaurantId +
            "/dishes/" +
            dishId,
          {
            method: "DELETE"
          }
        );
  
        debugEl.textContent = "Status: " + res.status;
  
        if (!res.ok) {
          alert("Failed to delete dish.");
          return;
        }
  
        loadDishesForRestaurant(selectedRestaurantId);
  
      } catch (err) {
        console.error(err);
        debugEl.textContent = "Error: " + err.message;
      }
    }
  
    // --- POST /api/restaurants/{id}/dishes ---
    async function handleCreateDish(event) {
      event.preventDefault();
  
      if (!selectedRestaurantId) {
        alert("Please select a restaurant first.");
        return;
      }
  
      var name = dishNameInput.value.trim();
      var priceValue = dishPriceInput.value;
      var description = dishDescriptionInput.value.trim();
  
      if (!name || !priceValue) {
        alert("Please enter dish name and price.");
        return;
      }
  
      var body = {
        name: name,
        price: parseFloat(priceValue),
        description: description
      };
  
      debugEl.textContent =
        "Calling backend (POST /restaurants/" + selectedRestaurantId + "/dishes)...";
  
      try {
        var res = await fetch(
          API_BASE + "/restaurants/" + selectedRestaurantId + "/dishes",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
          }
        );
  
        var text = await res.text();
  
        debugEl.textContent =
          "Status: " + res.status + "\n\n" +
          "Raw response:\n" + text;
  
        if (!res.ok) {
          alert("Failed to create dish.");
          return;
        }
  
        dishForm.reset();
        loadDishesForRestaurant(selectedRestaurantId);
  
      } catch (err) {
        console.error(err);
        debugEl.textContent = "Error: " + err.message;
      }
    }
  
    // Load restaurants on page load
    loadRestaurants();
  });
  