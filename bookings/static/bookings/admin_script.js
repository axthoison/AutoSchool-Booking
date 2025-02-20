// Add event listeners to car type buttons
document.querySelectorAll(".car-type-btn").forEach(button => {
    button.addEventListener("click", function() {
        // Get the value from the clicked button
        let selectedCarType = this.getAttribute("data-value");

        // Update the hidden input field
        document.getElementById("car-type").value = selectedCarType;

        // Highlight the selected button (optional for better UX)
        document.querySelectorAll(".car-type-btn").forEach(btn => btn.classList.remove("selected"));
        this.classList.add("selected");

        console.log("Selected car type:", selectedCarType); // Debugging
    });
});

document.getElementById("add-slot-form").addEventListener("submit", function(event) {
    event.preventDefault();

    let instructor = document.getElementById("instructor").value;
    let startDate = document.getElementById("start-date").value;
    let endDate = document.getElementById("end-date").value;
    let startTime = document.getElementById("start-time").value;
    let endTime = document.getElementById("end-time").value;
    let carType = document.getElementById("car-type").value;

    if (!instructor || !startDate || !endDate || !startTime || !endTime || !carType) {
        alert("Please fill in all fields!");
        return;
    }

    let slotData = {
        instructor: instructor,
        start_date: startDate,
        end_date: endDate,
        start_time: startTime,
        end_time: endTime,
        car_type: carType
    };

    fetch("/bookings/add-timeslots/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify(slotData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Time slots added successfully!");
            loadAvailableSlots();  // Refresh available slots
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => console.error("Error:", error));
});

// Function to fetch and display available slots
function loadAvailableSlots() {
    fetch("/bookings/get-timeslots/")
    .then(response => response.json())
    .then(data => {
        let slotsContainer = document.getElementById("slots-container");
        slotsContainer.innerHTML = ""; // Clear existing slots

        data.forEach(slot => {
            let li = document.createElement("li");
            li.textContent = `${slot.date} ${slot.start_time} - ${slot.end_time} (${slot.car_type}) - Instructor: ${slot.instructor__name}`;
            slotsContainer.appendChild(li);
        });

        populateCalendar(data);  // ✅ Update the calendar UI
    })
    .catch(error => console.error("Error loading slots:", error));
}

// Function to get CSRF token (needed for Django)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Load slots on page load
document.addEventListener("DOMContentLoaded", loadAvailableSlots);
