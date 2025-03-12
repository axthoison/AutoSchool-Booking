document.addEventListener("DOMContentLoaded", function () {
    const addInstructorForm = document.getElementById("add-instructor-form");
    const addSlotForm = document.getElementById("add-slot-form");
    const bookingForm = document.getElementById("booking-form");
    const carTypeButtons = document.querySelectorAll(".car-type-btn");
    const carTypeInput = document.getElementById("car-type");
    const calendarEl = document.getElementById("calendar");
    const manualBookingBtn = document.getElementById("manual-booking-btn");
    const slotSelect = document.getElementById("manual-slot");
    const userSearch = document.getElementById("manual-user-search");
    const userInput = document.getElementById("manual-user");
    const successMessage = document.getElementById("success-message");
    let selectedInstructors = new Set();
    let selectedCarTypes = new Set();

    // Handle car type button selection
    carTypeButtons.forEach((button) => {
        button.addEventListener("click", function () {
            carTypeButtons.forEach((btn) => btn.classList.remove("selected"));
            this.classList.add("selected");
            carTypeInput.value = this.getAttribute("data-value");
        });
    });

    // Instructor filtering
    const instructorItems = document.querySelectorAll(".instructor-list li");
    instructorItems.forEach(item => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = item.textContent.trim();
        item.insertBefore(checkbox, item.firstChild);

        checkbox.addEventListener("change", function() {
            if (this.checked) {
                selectedInstructors.add(this.value);
            } else {
                selectedInstructors.delete(this.value);
            }
            if (calendar) calendar.refetchEvents();
        });
    });

    // Car type filtering
    const carTypeCheckboxes = document.querySelectorAll(".car-type-checkbox");
    carTypeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function() {
            if (this.checked) {
                selectedCarTypes.add(this.value);
            } else {
                selectedCarTypes.delete(this.value);
            }
            if (calendar) calendar.refetchEvents();
        });
    });

    // Add instructor form submission
    if (addInstructorForm) {
        addInstructorForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const formData = new FormData(this);

            fetch(window.location.href, {
                method: "POST",
                body: formData,
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Eroare la procesarea cererii");
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    showSuccessMessage(`Instructor adăugat: ${data.instructor_name}, Parola: ${data.temp_password}`);
                    // Refresh instructor list dynamically if needed
                    fetchInstructorList();
                } else {
                    alert("Eroare: " + (data.error || "Unknown error"));
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Eroare la adăugarea instructorului: " + error.message);
            });
        });
    }

    // Add slot form submission
    if (addSlotForm) {
        addSlotForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const instructor = document.getElementById("instructor").value;
            const startDate = document.getElementById("start-date").value;
            const endDate = document.getElementById("end-date").value;
            const startTime = document.getElementById("start-time").value;
            const endTime = document.getElementById("end-time").value;
            const carType = carTypeInput.value;

            if (!instructor || !startDate || !startTime || !endTime || !carType) {
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
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccessMessage("Slot adăugat cu succes!");
                    if (calendar) calendar.refetchEvents();
                } else {
                    alert("Eroare: " + (data.error || "Unknown error"));
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Eroare la adăugarea slotului");
            });
        });
    }

    // Populate slot options
    function populateSlotOptions(selectedSlotId = null) {
        fetch("/bookings/get-timeslots/")
            .then(response => response.json())
            .then(data => {
                slotSelect.innerHTML = '<option value="">Selectează un slot</option>';
                data.available_slots.forEach(slot => {
                    if ((selectedInstructors.size === 0 || selectedInstructors.has(slot.instructor__name)) &&
                        (selectedCarTypes.size === 0 || selectedCarTypes.has(slot.car_type))) {
                        const option = document.createElement("option");
                        option.value = slot.id;
                        option.text = `${slot.date} ${slot.start_time} - ${slot.end_time} (${slot.instructor__name}, ${slot.car_type === 'automatic' ? 'Cutie Automată' : 'Cutie Mecanică'})`;
                        if (selectedSlotId && slot.id === selectedSlotId) {
                            option.selected = true;
                        }
                        slotSelect.appendChild(option);
                    }
                });
            })
            .catch(error => console.error("Error fetching slots:", error));
    }

    // Fetch and update instructor list dynamically
    function fetchInstructorList() {
        fetch(window.location.href, { method: "GET" })
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const newList = doc.querySelector(".instructor-list ul");
                document.querySelector(".instructor-list ul").innerHTML = newList.innerHTML;
                // Re-attach instructor filter listeners
                const instructorItems = document.querySelectorAll(".instructor-list li");
                instructorItems.forEach(item => {
                    const checkbox = item.querySelector("input[type='checkbox']") || document.createElement("input");
                    if (!checkbox.parentElement) {
                        checkbox.type = "checkbox";
                        checkbox.value = item.textContent.trim();
                        item.insertBefore(checkbox, item.firstChild);
                        checkbox.addEventListener("change", function() {
                            if (this.checked) {
                                selectedInstructors.add(this.value);
                            } else {
                                selectedInstructors.delete(this.value);
                            }
                            if (calendar) calendar.refetchEvents();
                        });
                    }
                });
            });
    }

    // Manual booking toggle
    if (manualBookingBtn) {
        manualBookingBtn.addEventListener("click", () => {
            const isVisible = bookingForm.style.display === "block";
            bookingForm.style.display = isVisible ? "none" : "block";
            if (!isVisible) populateSlotOptions();
        });
    }

    // User search
    if (userSearch) {
        userSearch.addEventListener("input", function () {
            const selectedOption = document.querySelector(`#user-options option[value="${this.value}"]`);
            userInput.value = selectedOption ? selectedOption.getAttribute("data-id") : "";
        });
    }

    // Booking form submission
    if (bookingForm) {
        bookingForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const slotId = document.getElementById("manual-slot").value;
            const userId = document.getElementById("manual-user").value;

            if (!slotId || !userId) {
                alert("Slotul și utilizatorul sunt obligatorii!");
                return;
            }

            const formData = new FormData(this);
            fetch(window.location.href, {
                method: "POST",
                body: formData,
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Eroare la procesarea cererii");
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    showSuccessMessage("Slot rezervat cu succes!");
                    bookingForm.style.display = "none";
                    if (calendar) calendar.refetchEvents();
                } else {
                    alert("Eroare: " + (data.error || "Unknown error"));
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Eroare la adăugarea rezervării: " + error.message);
            });
        });
    }

    // Success message display
    function showSuccessMessage(message) {
        successMessage.textContent = message;
        successMessage.style.display = "block";
        setTimeout(() => {
            successMessage.style.display = "none";
        }, 3000);
    }

    // Initialize FullCalendar
    if (calendarEl) {
        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "timeGridWeek",
            locale: "ro",
            headerToolbar: {
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay"
            },
            slotMinTime: "08:00:00",
            slotMaxTime: "20:00:00",
            slotDuration: "00:30:00",
            slotLabelInterval: "01:00:00",
            slotHeight: 60,
            events: function (fetchInfo, successCallback, failureCallback) {
                fetch("/bookings/get-timeslots/")
                    .then(response => response.json())
                    .then(data => {
                        let events = [];
                        if (data.available_slots) {
                            data.available_slots.forEach(slot => {
                                if ((selectedInstructors.size === 0 || selectedInstructors.has(slot.instructor__name)) &&
                                    (selectedCarTypes.size === 0 || selectedCarTypes.has(slot.car_type))) {
                                    events.push({
                                        title: `${slot.instructor__name} - ${slot.car_type === 'automatic' ? 'Cutie Automată' : 'Cutie Mecanică'}`,
                                        start: `${slot.date}T${slot.start_time}`,
                                        end: `${slot.date}T${slot.end_time}`,
                                        classNames: ['available'],
                                        backgroundColor: '#22c55e',
                                        extendedProps: { slotId: slot.id }
                                    });
                                }
                            });
                        }
                        if (data.confirmed_bookings) {
                            data.confirmed_bookings.forEach(booking => {
                                if ((selectedInstructors.size === 0 || selectedInstructors.has(booking.timeslot__instructor__name)) &&
                                    (selectedCarTypes.size === 0 || selectedCarTypes.has(booking.timeslot__car_type))) {
                                    events.push({
                                        title: `${booking.timeslot__instructor__name} - ${booking.user__username} (${booking.timeslot__car_type === 'automatic' ? 'Cutie Automată' : 'Cutie Mecanică'})`,
                                        start: `${booking.timeslot__date}T${booking.timeslot__start_time}`,
                                        end: `${booking.timeslot__date}T${booking.timeslot__end_time}`,
                                        classNames: ['booked'],
                                        backgroundColor: '#ef4444'
                                    });
                                }
                            });
                        }
                        successCallback(events);
                    })
                    .catch(error => {
                        console.error("Error fetching events:", error);
                        failureCallback(error);
                    });
            },
            eventClick: function(info) {
                if (info.event.classNames.includes('available')) {
                    bookingForm.style.display = "block";
                    populateSlotOptions(info.event.extendedProps.slotId);
                }
            },
            eventDidMount: function(info) {
                if (info.event.classNames.includes('available')) {
                    info.el.style.backgroundColor = '#22c55e';
                } else if (info.event.classNames.includes('booked')) {
                    info.el.style.backgroundColor = '#ef4444';
                }
            }
        });
        calendar.render();
    }

    function getCSRFToken() {
        const tokenElement = document.querySelector('[name=csrfmiddlewaretoken]');
        return tokenElement ? tokenElement.value : '';
    }
});