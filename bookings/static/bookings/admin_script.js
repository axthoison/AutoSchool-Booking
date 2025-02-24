document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("add-slot-form");
    const carTypeButtons = document.querySelectorAll(".car-type-btn");
    const carTypeInput = document.getElementById("car-type");
    const calendarEl = document.getElementById("calendar");

    // Handle car type button selection
    carTypeButtons.forEach((button) => {
        button.addEventListener("click", function () {
            carTypeButtons.forEach((btn) => btn.classList.remove("selected"));
            this.classList.add("selected");
            carTypeInput.value = this.getAttribute("data-value");
        });
    });

    // Handle form submission for adding time slots
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const instructor = document.getElementById("instructor").value;
        const startDate = document.getElementById("start-date").value;
        const endDate = document.getElementById("end-date").value;
        const startTime = document.getElementById("start-time").value;
        const endTime = document.getElementById("end-time").value;
        const carType = carTypeInput.value;

        if (!instructor || !startDate || !endDate || !startTime || !endTime || !carType) {
            alert("Toate câmpurile sunt obligatorii!");
            return;
        }

        fetch("/bookings/add-timeslots/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },
            body: JSON.stringify({
                instructor: instructor,
                start_date: startDate,
                end_date: endDate,
                start_time: startTime,
                end_time: endTime,
                car_type: carType,
            }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert("Sloturi adăugate cu succes!");
                calendar.refetchEvents(); // Refresh calendar
            } else {
                alert("Eroare: " + data.error);
            }
        })
        .catch((error) => console.error("Error:", error));
    });

    // Fetch CSRF token
    function getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]').value;
    }

    // Initialize FullCalendar
    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "timeGridWeek",
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,timeGridDay",
        },
        events: function (fetchInfo, successCallback, failureCallback) {
            fetch("/bookings/get-timeslots/")
                .then((response) => response.json())
                .then((data) => {
                    let events = [];

                    data.available_slots.forEach(slot => {
                        events.push({
                            title: `${slot.car_type} - ${slot.instructor__name}`,
                            start: `${slot.date}T${slot.start_time}`,
                            end: `${slot.date}T${slot.end_time}`,
                            color: "#3788d8"
                        });
                    });

                    data.confirmed_bookings.forEach(booking => {
                        events.push({
                            title: `Rezervat - ${booking.user__username}`,
                            start: `${booking.timeslot__date}T${booking.timeslot__start_time}`,
                            end: `${booking.timeslot__date}T${booking.timeslot__end_time}`,
                            color: "#d83737"
                        });
                    });

                    successCallback(events);
                })
                .catch((error) => {
                    console.error("Error fetching events:", error);
                    failureCallback(error);
                });
        },
    });

    calendar.render();
});
